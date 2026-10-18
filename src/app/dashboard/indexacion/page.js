'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { guardarLiquidacionBd } from '../../actions/liquidaciones';

function IndexacionApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const casoId = searchParams.get('casoId');

  const [ipcData, setIpcData] = useState({});
  const [filas, setFilas] = useState([{ id: Date.now(), capital: '', fechaInicial: '' }]);
  const [fechaFinal, setFechaFinal] = useState('');
  const [conIntereses, setConIntereses] = useState(false);
  
  const [resultado, setResultado] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('https://microapp-indexacion.vercel.app/ipc_data.json')
      .then(res => res.json())
      .then(data => setIpcData(data))
      .catch(err => console.error('Error cargando IPC:', err));
  }, []);

  const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 });

  const agregarFila = () => setFilas([...filas, { id: Date.now(), capital: '', fechaInicial: '' }]);
  const eliminarFila = (id) => {
    if (filas.length > 1) {
      setFilas(filas.filter(f => f.id !== id));
      setErrorMsg(null);
    } else {
      setErrorMsg("El memorial debe contener al menos un capital a liquidar.");
    }
  };
  const actualizarFila = (id, campo, valor) => {
    setFilas(filas.map(f => f.id === id ? { ...f, [campo]: valor } : f));
  };

  const ejecutarLiquidacion = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setResultado(null);

    if (!ipcData[fechaFinal]) {
      setErrorMsg(`No hay índice DANE disponible para la fecha final global (${fechaFinal}).`);
      return;
    }

    const ipcFinal = ipcData[fechaFinal].indice;
    let [anioFinN, mesFinN] = fechaFinal.split('-').map(Number);

    let totalHistorico = 0, totalIndexado = 0, totalIntereses = 0;
    let memoriaCalculos = [];
    let errorBloqueante = false;

    filas.forEach((fila, index) => {
      const capital = parseFloat(fila.capital);
      const fechaInicial = fila.fechaInicial;

      if (!capital || !fechaInicial) return;

      if (fechaInicial > fechaFinal) {
        setErrorMsg(`Error en rubro ${index + 1}: La causación no puede ser posterior a la actualización.`);
        errorBloqueante = true; return;
      }
      if (!ipcData[fechaInicial]) {
        setErrorMsg(`Error en rubro ${index + 1}: Índice no encontrado para (${fechaInicial}).`);
        errorBloqueante = true; return;
      }

      const ipcInicial = ipcData[fechaInicial].indice;
      const factor = ipcFinal / ipcInicial;
      const capitalIndexado = capital * factor;

      let interesCivil = 0, mesesMora = 0;
      if (conIntereses) {
        let [anioIni, mesIni] = fechaInicial.split('-').map(Number);
        mesesMora = ((anioFinN - anioIni) * 12) + (mesFinN - mesIni);
        if (mesesMora < 0) mesesMora = 0;
        interesCivil = capitalIndexado * (0.005 * mesesMora);
      }

      totalHistorico += capital;
      totalIndexado += capitalIndexado;
      totalIntereses += interesCivil;

      memoriaCalculos.push({
        numero: index + 1, fecha: fechaInicial, capital,
        ipcInicial, factor, indexado: capitalIndexado,
        mesesMora, interes: interesCivil, total: capitalIndexado + interesCivil
      });
    });

    if (errorBloqueante) return;

    const granTotalFinal = totalIndexado + totalIntereses;
    let textoMemorial = `Para la presente liquidación, se aplicó la fórmula jurisprudencial de indexación (Va = Vh * IPC Final / IPC Inicial). Se procesaron ${memoriaCalculos.length} obligaciones (${formatoCOP.format(totalHistorico)}). Al traerlos a valor presente (${fechaFinal}, IPC ${ipcFinal}), el capital indexado es de ${formatoCOP.format(totalIndexado)}.`;
    if (conIntereses) textoMemorial += ` Conforme al art. 1617 del C.C., se liquidaron intereses moratorios civiles (0.5% mensual) sobre el capital indexado, sumando ${formatoCOP.format(totalIntereses)}.`;
    textoMemorial += ` El GRAN TOTAL A PAGAR es de ${formatoCOP.format(granTotalFinal)}.`;

    setResultado({
      totalHistorico, totalIndexado, totalIntereses, granTotalFinal,
      textoMemorial, memoriaCalculos, fechaFinal, ipcFinal, conIntereses
    });
  };

  const guardarEnExpediente = async () => {
    if (!casoId || !resultado) return;
    setIsSaving(true);
    try {
      await guardarLiquidacionBd(casoId, 'Actualización de Capital (Indexación)', resultado);
      router.push(`/dashboard/casos/${casoId}`);
    } catch (error) {
      alert("Error al guardar: " + error.message);
      setIsSaving(false);
    }
  };

  const copiarDictamen = () => {
    if (resultado) navigator.clipboard.writeText(resultado.textoMemorial);
    alert("¡Dictamen copiado al portapapeles!");
  };

  return (
    <div className="bg-blue-50/50 min-h-screen text-gray-800 antialiased p-4 md:p-8">
      <div className="max-w-5xl mx-auto mb-4 print:hidden">
        <Link href={casoId ? `/dashboard/casos/${casoId}` : "/dashboard"} className="inline-flex items-center text-sm font-bold text-[#1E3A8A] hover:text-blue-700 bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-sm transition-all">
          &larr; {casoId ? "Volver al Expediente" : "Volver al Despacho"}
        </Link>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-900 to-slate-800 text-white p-8 print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002-2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Liquidación Multicapital</h1>
              <p className="text-sm md:text-base text-blue-100 mt-1 font-medium">Indexación Consolidada + Intereses Moratorios</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 print:hidden">
          <form onSubmit={ejecutarLiquidacion} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Rubros a Liquidar</h2>
              <div className="space-y-4">
                {filas.map((fila) => (
                  <div key={fila.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-blue-50/50 p-5 rounded-xl border border-blue-100 transition-all">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-bold text-gray-800 mb-1">💰 Capital Base (COP)</label>
                      <input type="number" required min="1" step="any" value={fila.capital} onChange={(e) => actualizarFila(fila.id, 'capital', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="Ej: 2000000" />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-sm font-bold text-gray-800 mb-1">📅 Fecha Causación</label>
                      <input type="month" required value={fila.fechaInicial} onChange={(e) => actualizarFila(fila.id, 'fechaInicial', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                    </div>
                    <div className="md:col-span-1 flex justify-center pb-3">
                      <button type="button" onClick={() => eliminarFila(fila.id)} className="text-red-400 hover:text-red-600 transition" title="Eliminar fila">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={agregarFila} className="mt-4 w-full bg-white border-2 border-dashed border-blue-300 hover:bg-blue-50 hover:border-blue-500 text-blue-600 font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Añadir otro rubro a la liquidación
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <label className="block text-base font-bold text-gray-800 mb-1">🗓️ Fecha de Actualización (Global)</label>
              <input type="month" required value={fechaFinal} onChange={(e) => setFechaFinal(e.target.value)}
                className="w-full md:w-1/2 px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-lg font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-sm cursor-pointer" />
            </div>

            <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-xl">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={conIntereses} onChange={(e) => setConIntereses(e.target.checked)} className="w-6 h-6 text-indigo-600 rounded cursor-pointer" />
                <span className="text-base font-bold text-slate-800">Liquidación Híbrida: Sumar Interés Legal Civil (6% Anual)</span>
              </label>
            </div>

            {errorMsg && <div className="text-red-700 text-base font-semibold bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm mt-4">{errorMsg}</div>}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg mt-6 transition-all flex justify-center items-center gap-2">
              Ejecutar Liquidación Consolidada
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v1m-6 4h.01M12 12h.01M15 12h.01M12 15h.01M9 15h.01M7 21h10" /></svg>
            </button>
          </form>
        </div>

        {resultado && (
          <div className="border-t-2 border-gray-100 bg-gray-50">
            <div className="bg-white p-8">
              <div className="mb-8 pb-6 border-b-2 border-gray-100 text-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dictamen de Liquidación Judicial</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Capital Histórico</h2>
                  <p className="text-2xl font-black text-slate-700">{formatoCOP.format(resultado.totalHistorico)}</p>
                </div>
                {resultado.conIntereses && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
                    <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Intereses (6% Anual)</h2>
                    <p className="text-2xl font-black text-indigo-700">{formatoCOP.format(resultado.totalIntereses)}</p>
                  </div>
                )}
                <div className={`bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 text-center shadow-sm ${resultado.conIntereses ? 'md:col-span-1' : 'md:col-span-2'}`}>
                  <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Gran Total a Pagar</h2>
                  <p className="text-2xl md:text-3xl font-black text-emerald-700 drop-shadow-sm">{formatoCOP.format(resultado.granTotalFinal)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-base font-bold text-slate-800 mb-3">Sustento Jurídico y Texto para Memorial:</label>
                <div className="bg-slate-50 border-l-4 border-slate-400 p-5 rounded-r-xl text-sm text-slate-700 font-mono leading-relaxed">{resultado.textoMemorial}</div>
              </div>

              {/* === BOTÓN GIGANTE DE GUARDAR EN BASE DE DATOS === */}
              {casoId && (
                <div className="mt-8 pt-6 border-t border-gray-200 print:hidden">
                  <button 
                    onClick={guardarEnExpediente} 
                    disabled={isSaving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg py-5 px-6 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    {isSaving ? 'Guardando permanentemente...' : 'GUARDAR RESULTADOS EN EL EXPEDIENTE'}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-2">Esta liquidación quedará vinculada permanentemente a este radicado judicial.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 print:hidden">
                <button onClick={copiarDictamen} className="w-full bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-lg py-4 px-6 rounded-xl shadow-sm transition flex items-center justify-center gap-3">
                  Copiar Dictamen
                </button>
                <button onClick={() => window.print()} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-3">
                  Imprimir / PDF
                </button>
              </div>

              {/* === MATRIZ RESUMEN RESTAURADA === */}
              <div className="mt-10 pt-2 print:hidden">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Matriz Resumen de Consolidación Multicapital</h3>
                <div className="rounded-xl border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600 whitespace-nowrap">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">No.</th>
                        <th className="px-4 py-3">Causación</th>
                        <th className="px-4 py-3 text-right">Cap. Base</th>
                        <th className="px-4 py-3 text-center">Factor</th>
                        <th className="px-4 py-3 text-right">Indexado</th>
                        {resultado.conIntereses && (
                          <>
                            <th className="px-4 py-3 text-center">Mora</th>
                            <th className="px-4 py-3 text-right">Interés</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-right">Total Pagar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {resultado.memoriaCalculos.map((c) => (
                        <tr key={c.numero} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-500">{c.numero}</td>
                          <td className="px-4 py-3 text-slate-700">{c.fecha}</td>
                          <td className="px-4 py-3 text-right">{formatoCOP.format(c.capital)}</td>
                          <td className="px-4 py-3 text-center font-mono text-xs">{c.factor.toFixed(5)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatoCOP.format(c.indexado)}</td>
                          {resultado.conIntereses && (
                            <>
                              <td className="px-4 py-3 text-center">{c.mesesMora}</td>
                              <td className="px-4 py-3 text-right text-indigo-600">{formatoCOP.format(c.interes)}</td>
                            </>
                          )}
                          <td className="px-4 py-3 text-right text-emerald-700 font-bold">{formatoCOP.format(c.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 border-t-2 border-slate-300">
                        <td colSpan="2" className="px-4 py-4 text-right font-black text-slate-800 text-xs">TOTALES:</td>
                        <td className="px-4 py-4 text-right font-black text-slate-800">{formatoCOP.format(resultado.totalHistorico)}</td>
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4 text-right font-black text-slate-800">{formatoCOP.format(resultado.totalIndexado)}</td>
                        {resultado.conIntereses && (
                          <>
                            <td className="px-4 py-4"></td>
                            <td className="px-4 py-4 text-right font-black text-indigo-700">{formatoCOP.format(resultado.totalIntereses)}</td>
                          </>
                        )}
                        <td className="px-4 py-4 text-right font-black text-emerald-800 text-lg">{formatoCOP.format(resultado.granTotalFinal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div> 
          </div>
        )}
      </div>
    </div>
  );
}

export default function IndexacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#1E3A8A] font-bold">Cargando herramienta...</div>}>
      <IndexacionApp />
    </Suspense>
  );
}