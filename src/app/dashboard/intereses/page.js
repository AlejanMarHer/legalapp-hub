"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Historial de respaldo (Fallback) por si la API de Datos Abiertos falla
const mockTasasHistorial = [
  { mes: "2026-10", tasaEA: 28.5 },
  { mes: "2026-09", tasaEA: 28.8 },
  { mes: "2026-08", tasaEA: 29.1 },
  { mes: "2026-07", tasaEA: 29.3 },
  { mes: "2026-06", tasaEA: 29.5 },
  { mes: "2026-05", tasaEA: 29.8 },
];

// --- ALGORITMO DE FERIADOS COLOMBIA (LEY EMILIANI) ---
const calcularFestivosColombia = (year) => {
  const holidays = new Set();
  const add = (d) => holidays.add(d.toISOString().split("T")[0]);
  const createDate = (m, d) => new Date(`${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T12:00:00`);
  const nextMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    if (day !== 1) date.setDate(date.getDate() + ((8 - day) % 7 || 7));
    return date;
  };

  add(createDate(1, 1)); add(createDate(5, 1)); add(createDate(7, 20)); 
  add(createDate(8, 7)); add(createDate(12, 8)); add(createDate(12, 25));

  add(nextMonday(createDate(1, 6))); add(nextMonday(createDate(3, 19))); 
  add(nextMonday(createDate(6, 29))); add(nextMonday(createDate(8, 15))); 
  add(nextMonday(createDate(10, 12))); add(nextMonday(createDate(11, 1))); 
  add(nextMonday(createDate(11, 11)));

  const a = year % 19; const b = Math.floor(year / 100); const c = year % 100;
  const d = Math.floor(b / 4); const e = b % 4; const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3); const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4); const k = c % 4; const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451); const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = createDate(month, day);

  const addDays = (baseDate, days) => {
    const result = new Date(baseDate);
    result.setDate(result.getDate() + days);
    return result;
  };

  add(addDays(easter, -3)); add(addDays(easter, -2)); add(addDays(easter, 43)); 
  add(addDays(easter, 64)); add(addDays(easter, 71)); 

  return holidays;
};

const festivosCache = {};

const esDiaHabil = (dateObj) => {
  const year = dateObj.getFullYear();
  if (!festivosCache[year]) festivosCache[year] = calcularFestivosColombia(year);
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  return !festivosCache[year].has(dateObj.toISOString().split("T")[0]);
};

const getSiguienteDiaHabil = (dateObj) => {
  let d = new Date(dateObj);
  while (!esDiaHabil(d)) d.setDate(d.getDate() + 1);
  return d;
};

export default function InteresesApp() {
  const [formData, setFormData] = useState({
    capital: "",
    fechaInicio: "",
    fechaFin: "",
    tipoInteres: "moratorio_comercial",
  });

  const [abonos, setAbonos] = useState([]);
  const [resultados, setResultados] = useState(null);
  const [alertaFeriado, setAlertaFeriado] = useState(null);

  const [tasasHistoricas, setTasasHistoricas] = useState(mockTasasHistorial);
  const [estadoAPI, setEstadoAPI] = useState("cargando");

  useEffect(() => {
    const obtenerTasasSFC = async () => {
      try {
        const baseUrl = "https://www.datos.gov.co/resource/pare-7x5i.json";
        const params = new URLSearchParams({ "$limit": "100" });
        const urlAPI = `${baseUrl}?${params.toString()}`;
        
        const respuesta = await fetch(urlAPI);
        if (!respuesta.ok) throw new Error(`Falla en la API: ${respuesta.status}`);

        const datos = await respuesta.json();
        if (datos.length === 0) throw new Error("Datos vacíos de la SFC");

        const tasasMapeadas = datos.map((item) => {
          const campoFecha = item.vigenciadesde || item.fecha || item.fecha_inicio || Object.values(item).find(v => typeof v === 'string' && v.includes('T00:00:00'));
          const campoValor = item.valor || item.tasa || item.tasa_interes || item.interes_bancario_corriente;

          if (!campoFecha || !campoValor) return null;

          const fecha = new Date(campoFecha);
          const yyyy = fecha.getFullYear();
          const mm = String(fecha.getMonth() + 1).padStart(2, "0");
          return {
            mes: `${yyyy}-${mm}`,
            tasaEA: parseFloat(campoValor) 
          };
        }).filter(Boolean);

        tasasMapeadas.sort((a, b) => b.mes.localeCompare(a.mes));
        const tasasUnicas = Array.from(new Map(tasasMapeadas.map(item => [item.mes, item])).values());

        if (tasasUnicas.length > 0) {
          setTasasHistoricas(tasasUnicas);
          setEstadoAPI("conectado");
        } else {
          throw new Error("No se pudieron parsear los datos de la SFC");
        }
      } catch (error) {
        console.warn("LitisApp: Error al conectar con SFC. Fallback activo.", error);
        setEstadoAPI("error");
      }
    };

    obtenerTasasSFC();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const agregarAbono = () => setAbonos([...abonos, { fecha: "", monto: "" }]);
  const actualizarAbono = (index, campo, valor) => {
    const nuevosAbonos = [...abonos];
    nuevosAbonos[index][campo] = valor;
    setAbonos(nuevosAbonos);
  };
  const eliminarAbono = (index) => setAbonos(abonos.filter((_, i) => i !== index));

  // --- LÓGICA PARA PEGAR DESDE EXCEL ---
  const handlePasteAbonos = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    if (!pasteData) return;

    const rows = pasteData.split(/\r?\n/);
    const nuevosAbonos = [];

    rows.forEach(row => {
      const cols = row.split("\t");
      if (cols.length >= 2) {
        let rawDate = cols[0].trim();
        let parsedDate = "";

        // Formatear fecha colombiana (DD/MM/YYYY) o estándar (YYYY-MM-DD)
        if (rawDate.includes("/")) {
          const p = rawDate.split("/");
          if (p.length === 3) parsedDate = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
        } else if (rawDate.includes("-")) {
          const p = rawDate.split("-");
          if (p.length === 3) {
            parsedDate = p[0].length === 4 ? rawDate : `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
          }
        }

        // Limpiar el monto de signos $, puntos y dejar solo números o decimales
        let rawAmount = cols[1].replace(/[^0-9,-]+/g, "").replace(",", ".");
        let parsedAmount = parseFloat(rawAmount);

        if (parsedDate && !isNaN(parsedAmount) && parsedAmount > 0) {
          nuevosAbonos.push({ fecha: parsedDate, monto: parsedAmount.toString() });
        }
      }
    });

    if (nuevosAbonos.length > 0) {
      setAbonos([...abonos, ...nuevosAbonos]);
      // Limpiamos el textarea después de procesar
      e.target.value = "";
    } else {
      alert("No se detectó un formato válido. Asegúrate de copiar desde Excel 2 columnas sin títulos: [Fecha] y [Monto].");
    }
  };

  const parseDate = (dateStr) => new Date(`${dateStr}T12:00:00`);

  const formatMoneda = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const calcularLiquidacion = (e) => {
    e.preventDefault();
    setAlertaFeriado(null);

    const capitalInicial = parseFloat(formData.capital);
    if (!capitalInicial || capitalInicial <= 0) return alert("Ingrese un capital válido.");
    if (!formData.fechaInicio || !formData.fechaFin) return alert("Ingrese fechas válidas.");

    const startRaw = parseDate(formData.fechaInicio);
    const end = parseDate(formData.fechaFin);

    if (startRaw > end) return alert("La fecha de inicio no puede ser mayor a la fecha final.");

    const start = getSiguienteDiaHabil(startRaw);
    if (start.getTime() !== startRaw.getTime()) {
      setAlertaFeriado(`La exigibilidad cayó en un día inhábil (${startRaw.toISOString().split("T")[0]}). Trasladado al día hábil siguiente: ${start.toISOString().split("T")[0]}.`);
    }

    let eventos = [{ date: start, type: "start", amount: 0 }];
    abonos.forEach((abono) => {
      if (abono.fecha && parseFloat(abono.monto) > 0) {
        eventos.push({ date: parseDate(abono.fecha), type: "abono", amount: parseFloat(abono.monto) });
      }
    });
    eventos.push({ date: end, type: "end", amount: 0 });

    eventos.sort((a, b) => {
      if (a.date.getTime() !== b.date.getTime()) return a.date - b.date;
      const order = { start: 1, abono: 2, end: 3 };
      return order[a.type] - order[b.type];
    });

    eventos = eventos.filter((ev) => ev.date >= start && ev.date <= end);

    let capitalActual = capitalInicial;
    let interesTotalGenerado = 0;
    let interesAcumuladoPendiente = 0;
    let currentDate = start;
    let filasLiquidacion = [];

    for (let i = 1; i < eventos.length; i++) {
      let nextEvent = eventos[i];
      let diffTime = nextEvent.date - currentDate;
      let days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (days > 0) {
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
        const key = `${yyyy}-${mm}`;
        
        const tasaBaseEA = tasasHistoricas.find((t) => t.mes === key)?.tasaEA || 28.5;

        let tasaAplicar = tasaBaseEA; 
        if (formData.tipoInteres === "corriente") tasaAplicar = tasaBaseEA * 0.6; 
        if (formData.tipoInteres === "moratorio_civil") tasaAplicar = 6.0;

        const tasaDiaria = tasaAplicar / 100 / 365;
        const interesPeriodo = capitalActual * tasaDiaria * days;
        
        const operacionStr = `${formatMoneda(capitalActual)} × (${tasaAplicar.toFixed(2)}% / 365) × ${days}`;
        
        interesTotalGenerado += interesPeriodo;
        interesAcumuladoPendiente += interesPeriodo;

        filasLiquidacion.push({
          tipo: "periodo",
          desde: currentDate.toISOString().split("T")[0],
          hasta: nextEvent.date.toISOString().split("T")[0],
          dias: days,
          tasa: `${tasaAplicar.toFixed(2)}% EA`,
          operacion: operacionStr,
          interes: interesPeriodo,
          saldoCapital: capitalActual,
        });
      }

      if (nextEvent.type === "abono") {
        let montoDisponible = nextEvent.amount;
        let pagoAInteres = Math.min(montoDisponible, interesAcumuladoPendiente);
        interesAcumuladoPendiente -= pagoAInteres;
        montoDisponible -= pagoAInteres;

        let pagoACapital = Math.min(montoDisponible, capitalActual);
        capitalActual -= pagoACapital;

        filasLiquidacion.push({
          tipo: "abono",
          fecha: nextEvent.date.toISOString().split("T")[0],
          montoAbono: nextEvent.amount,
          pagoInteres: pagoAInteres,
          pagoCapital: pagoACapital,
          saldoCapital: capitalActual,
        });
      }
      currentDate = nextEvent.date;
    }

    setResultados({
      filas: filasLiquidacion,
      totales: {
        capitalInicial,
        capitalFinal: capitalActual,
        interesGenerado: interesTotalGenerado,
        interesPendiente: interesAcumuladoPendiente,
        totalAPagar: capitalActual + interesAcumuladoPendiente,
      },
    });
  };

  const exportarPDF = () => {
    if (!resultados) return;
    const doc = new jsPDF({ orientation: "landscape" });
    
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text("LitisApp - Liquidación de Crédito", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString("es-CO")}`, 14, 26);

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Capital Inicial: ${formatMoneda(resultados.totales.capitalInicial)}`, 14, 36);
    doc.text(`Saldo a Capital: ${formatMoneda(resultados.totales.capitalFinal)}`, 14, 42);
    doc.text(`Intereses Pendientes: ${formatMoneda(resultados.totales.interesPendiente)}`, 14, 48);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total a Pagar: ${formatMoneda(resultados.totales.totalAPagar)}`, 14, 56);

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    doc.text("Fórmula aplicada por periodo: Interés = Saldo Capital × (Tasa Anual / 365 días) × Días Liquidados", 14, 66);

    const tableData = resultados.filas.map((fila) => {
      if (fila.tipo === "periodo") {
        return [
          `${fila.desde} a ${fila.hasta}`,
          fila.dias.toString(),
          fila.tasa,
          fila.operacion, 
          formatMoneda(fila.interes),
          formatMoneda(fila.saldoCapital),
        ];
      } else {
        return [
          `Abono: ${fila.fecha}`,
          "-",
          "-",
          "-",
          `- ${formatMoneda(fila.montoAbono)}`,
          formatMoneda(fila.saldoCapital),
        ];
      }
    });

    autoTable(doc, {
      startY: 70,
      head: [["Periodo", "Días", "Tasa Aplicada", "Operación Matemática", "Intereses", "Saldo Capital"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 
        3: { cellWidth: 70, fontStyle: "italic" },
        4: { halign: "right" }, 
        5: { halign: "right" } 
      },
      willDrawCell: function (data) {
        if (data.row.raw[0].toString().includes("Abono")) {
          data.cell.styles.fillColor = [236, 253, 245]; 
          data.cell.styles.textColor = [21, 128, 61]; 
        }
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Generado por LitisApp - Liquidador de Intereses", 14, doc.internal.pageSize.height - 10);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }

    doc.save(`Liquidacion_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-[#1E3A8A] hover:text-blue-700 transition gap-1.5">
            &larr; Volver al Despacho
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          
          <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 md:p-8 flex items-center gap-4 border-b border-gray-100">
            <div className="bg-[#2D4A7A]/30 p-3.5 rounded-xl border border-blue-500/20 shadow-inner">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Liquidador de Intereses</h1>
              <p className="text-gray-300 text-xs md:text-sm mt-1">Cálculo de intereses corrientes y moratorios (Procesos Ejecutivos en Colombia)</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <form onSubmit={calcularLiquidacion} className="space-y-8">
              
              <div className="bg-white rounded-xl p-6 border border-gray-150/80 space-y-6">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                  <span>Datos de la Obligación</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-5 space-y-1">
                    <label className="block text-sm font-bold text-gray-700">💰 Capital Inicial (COP)</label>
                    <p className="text-xs text-gray-500">Monto histórico original de la deuda.</p>
                    <input type="number" name="capital" value={formData.capital} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition" placeholder="Ej: 15000000" required />
                  </div>

                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-bold text-gray-700">📅 Fecha Exigibilidad</label>
                      <p className="text-xs text-gray-500">Inicio de la mora.</p>
                      <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition" required />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-bold text-gray-700">📅 Fecha Liquidación</label>
                      <p className="text-xs text-gray-500">Hasta qué fecha liquidar.</p>
                      <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition" required />
                    </div>
                  </div>

                  <div className="md:col-span-12 space-y-1 relative">
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <label className="block text-sm font-bold text-gray-700">⚖️ Tipo de Interés</label>
                        <p className="text-xs text-gray-500">Seleccione el régimen de tasa aplicable.</p>
                      </div>
                      
                      {estadoAPI === "cargando" && (
                         <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded flex items-center gap-1">
                           <span className="animate-pulse h-1.5 w-1.5 bg-gray-400 rounded-full"></span> Conectando con SFC...
                         </span>
                      )}
                      {estadoAPI === "conectado" && (
                         <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-1 border border-green-200 rounded flex items-center gap-1">
                           <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span> Tasas actualizadas SFC
                         </span>
                      )}
                      {estadoAPI === "error" && (
                         <span className="text-[10px] font-semibold bg-orange-50 text-orange-700 px-2 py-1 border border-orange-200 rounded flex items-center gap-1">
                           <span className="h-1.5 w-1.5 bg-orange-500 rounded-full"></span> Usando respaldo local (SFC inactiva)
                         </span>
                      )}
                    </div>

                    <select name="tipoInteres" value={formData.tipoInteres} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none transition bg-white cursor-pointer">
                      <option value="moratorio_comercial">Moratorio Comercial (SFC)</option>
                      <option value="corriente">Remuneratorio / Corriente (60% SFC)</option>
                      <option value="moratorio_civil">Moratorio Civil (6% Anual fijo)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-150/80 space-y-4">
                <div className="flex justify-between items-start md:items-center border-b pb-3 flex-col md:flex-row gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">💸 Abonos a la Obligación</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Pagos parciales realizados (aplicación art. 881 C.Co).</p>
                  </div>
                </div>

                {/* ZONA DE PEGADO DE EXCEL */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <label className="block text-xs font-bold text-[#1E3A8A] mb-1">⚡ Pegado Masivo desde Excel</label>
                  <p className="text-[10px] text-gray-500 mb-2">Copia en tu Excel dos columnas sin encabezados (1. Fecha DD/MM/AAAA | 2. Monto) y haz Ctrl+V adentro del recuadro.</p>
                  <textarea
                    className="w-full h-12 bg-white border border-dashed border-blue-300 rounded-lg text-xs p-3 text-gray-500 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition"
                    placeholder="Haz clic aquí y presiona Ctrl + V para pegar tus abonos..."
                    onPaste={handlePasteAbonos}
                  ></textarea>
                </div>

                {abonos.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                    No has registrado abonos. Tu cálculo se realizará con el capital constante.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {abonos.map((abono, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50/50 p-3 rounded-xl border border-gray-150 relative">
                        <div className="sm:col-span-5">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha del Pago</label>
                          <input type="date" value={abono.fecha} onChange={(e) => actualizarAbono(index, "fecha", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none bg-white" required />
                        </div>
                        <div className="sm:col-span-6">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Monto Abonado (COP)</label>
                          <input type="number" value={abono.monto} placeholder="Monto ej: 2000000" onChange={(e) => actualizarAbono(index, "monto", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none bg-white" required />
                        </div>
                        <div className="sm:col-span-1 text-center pt-4 sm:pt-0">
                          <button type="button" onClick={() => eliminarAbono(index)} className="text-red-500 hover:text-red-700 font-bold text-lg p-1.5 transition rounded hover:bg-red-50 inline-flex items-center justify-center">
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" onClick={agregarAbono} className="w-full py-4 border-2 border-dashed border-blue-200 hover:border-blue-400 text-[#1E3A8A] rounded-xl font-bold flex items-center justify-center gap-2 transition bg-white/50 hover:bg-blue-50/30 text-sm cursor-pointer">
                  <span>+ Añadir abono manualmente</span>
                </button>
              </div>

              <div>
                <button type="submit" className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-base tracking-wide cursor-pointer">
                  <span>Ejecutar Liquidación de Intereses</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </button>
              </div>

              {alertaFeriado && (
                <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-xl">
                  <div className="flex gap-3">
                    <span className="text-blue-500 text-lg">ℹ️</span>
                    <div>
                      <p className="text-xs text-blue-900 font-semibold leading-relaxed">Ajuste de Día Hábil (Art. 829 C.Co)</p>
                      <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">{alertaFeriado}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {resultados && (
              <div className="pt-6 border-t border-gray-150 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#F8FAFC] p-5 rounded-xl border border-gray-100 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo Capital</span>
                    <span className="text-xl font-bold text-gray-800 mt-2">{formatMoneda(resultados.totales.capitalFinal)}</span>
                  </div>
                  <div className="bg-[#FEFCE8] p-5 rounded-xl border border-yellow-200/50 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Intereses Pendientes</span>
                    <span className="text-xl font-bold text-yellow-900 mt-2">{formatMoneda(resultados.totales.interesPendiente)}</span>
                  </div>
                  <div className="bg-[#EFF6FF] p-5 rounded-xl border border-blue-200/50 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">Total a Pagar</span>
                    <span className="text-2xl font-black text-[#1E3A8A] mt-2">{formatMoneda(resultados.totales.totalAPagar)}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Detalle de la Liquidación</h3>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Fórmula aplicada: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">I = Capital × (Tasa / 365) × Días</span>
                      </p>
                    </div>
                    <button onClick={exportarPDF} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-gray-50 hover:text-[#1E3A8A] transition cursor-pointer self-start sm:self-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
                          <th className="py-3 px-6">Periodo / Concepto</th>
                          <th className="py-3 px-4 text-center">Días</th>
                          <th className="py-3 px-4">Tasa</th>
                          <th className="py-3 px-4 hidden xl:table-cell">Operación Matemática</th>
                          <th className="py-3 px-4 text-right">Intereses</th>
                          <th className="py-3 px-6 text-right">Saldo Capital</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {resultados.filas.map((fila, i) => (
                          <tr key={i} className={fila.tipo === "abono" ? "bg-green-50/40" : "hover:bg-gray-50/50"}>
                            {fila.tipo === "periodo" ? (
                              <>
                                <td className="py-4 px-6 font-medium text-gray-950 whitespace-nowrap">{fila.desde} a {fila.hasta}</td>
                                <td className="py-4 px-4 text-center">{fila.dias}</td>
                                <td className="py-4 px-4 font-mono text-xs whitespace-nowrap">{fila.tasa}</td>
                                <td className="py-4 px-4 font-mono text-[10px] text-gray-400 hidden xl:table-cell whitespace-nowrap">{fila.operacion}</td>
                                <td className="py-4 px-4 text-right font-medium text-gray-900 whitespace-nowrap">{formatMoneda(fila.interes)}</td>
                                <td className="py-4 px-6 text-right whitespace-nowrap">{formatMoneda(fila.saldoCapital)}</td>
                              </>
                            ) : (
                              <>
                                <td className="py-4 px-6 text-green-800 font-bold whitespace-nowrap">🟢 Abono: {fila.fecha}</td>
                                <td className="py-4 px-4 text-green-700 text-xs" colSpan="2">
                                  Imp. Interés: {formatMoneda(fila.pagoInteres)} <br/>
                                  Imp. Capital: {formatMoneda(fila.pagoCapital)}
                                </td>
                                <td className="py-4 px-4 hidden xl:table-cell"></td>
                                <td className="py-4 px-4 text-right text-green-800 font-bold whitespace-nowrap">- {formatMoneda(fila.montoAbono)}</td>
                                <td className="py-4 px-6 text-right font-bold text-green-900 whitespace-nowrap">{formatMoneda(fila.saldoCapital)}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}