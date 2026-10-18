/**
 * Motor de Liquidación de Prestaciones Sociales e Indemnizaciones (Colombia - CST)
 * Basado en el cómputo de año comercial de 360 días (12 meses de 30 días).
 */

function parseDateParts(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error(`Formato de fecha inválido: ${dateStr}. Use YYYY-MM-DD.`);
  }
  return { year, month, day };
}

export function calculateDays360(startStr, endStr) {
  const start = parseDateParts(startStr);
  const end = parseDateParts(endStr);

  const normalizeDay = (y, m, d, isEndDate) => {
    if (d === 31) return 30;
    if (isEndDate && m === 2 && (d === 28 || d === 29)) {
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      if ((isLeap && d === 29) || (!isLeap && d === 28)) {
        return 30;
      }
    }
    return d;
  };

  const d1 = normalizeDay(start.year, start.month, start.day, false);
  const d2 = normalizeDay(end.year, end.month, end.day, true);

  const totalDays = (end.year - start.year) * 360 + (end.month - start.month) * 30 + (d2 - d1) + 1;
  return Math.max(0, totalDays);
}

function roundCOP(value) {
  return Math.round(value);
}

export function calculateLaborSettlement(input) {
  const variableAvg = input.variableSalaryAvg || 0;
  const isIntegral = input.isIntegralSalary || false;
  const unpaidCurrentYear = input.unpaidLeaveDaysCurrentYear || 0;
  const unpaidTotal = input.unpaidLeaveDaysTotal || unpaidCurrentYear;
  const vacationsTaken = input.vacationDaysTaken || 0;

  const totalDaysContract = calculateDays360(input.startDate, input.endDate);
  if (totalDaysContract <= 0) {
    throw new Error('La fecha de terminación debe ser igual o posterior a la fecha de inicio.');
  }

  const effectiveDaysContract = Math.max(0, totalDaysContract - unpaidTotal);

  const ordinarySalary = input.baseSalary + variableAvg;
  const appliesTransportAllowance = !isIntegral && !input.forceExcludeTransportAllowance && ordinarySalary <= input.smmlv * 2;
  const transportValue = appliesTransportAllowance ? input.transportAllowanceLegal : 0;

  const basePrestacional = ordinarySalary + transportValue; 
  const baseVacaciones = input.baseSalary + variableAvg;    
  const baseIndemnizacion = ordinarySalary;                 

  const endParts = parseDateParts(input.endDate);

  // A. CESANTÍAS
  const startOfCurrentYear = `${endParts.year}-01-01`;
  const cesantiasStartDate = input.startDate > startOfCurrentYear ? input.startDate : startOfCurrentYear;
  const rawDaysCesantias = calculateDays360(cesantiasStartDate, input.endDate);
  const daysCesantias = Math.max(0, rawDaysCesantias - unpaidCurrentYear);
  const amountCesantias = isIntegral ? 0 : roundCOP((basePrestacional * daysCesantias) / 360);

  // B. INTERESES SOBRE LAS CESANTÍAS
  const amountIntereses = isIntegral ? 0 : roundCOP((amountCesantias * daysCesantias * 0.12) / 360);

  // C. PRIMA DE SERVICIOS
  const startOfCurrentSemester = endParts.month <= 6 ? `${endParts.year}-01-01` : `${endParts.year}-07-01`;
  const primaStartDate = input.startDate > startOfCurrentSemester ? input.startDate : startOfCurrentSemester;
  const daysPrima = calculateDays360(primaStartDate, input.endDate);
  const amountPrima = isIntegral ? 0 : roundCOP((basePrestacional * daysPrima) / 360);

  // D. VACACIONES COMPENSADAS
  const accruedVacationDays = (effectiveDaysContract * 15) / 360;
  const pendingVacationDays = Math.max(0, accruedVacationDays - vacationsTaken);
  const dailyVacationRate = baseVacaciones / 30;
  const amountVacaciones = roundCOP(pendingVacationDays * dailyVacationRate);

  // E. INDEMNIZACIÓN POR DESPIDO SIN JUSTA CAUSA
  let amountIndemnizacion = 0;
  let indemnityDaysEquivalent = 0;
  let indemnityFormulaDesc = 'No aplica por causal de terminación.';

  if (input.terminationReason === 'SIN_JUSTA_CAUSA') {
    const dailySalary = baseIndemnizacion / 30;

    if (input.contractType === 'INDEFINIDO') {
      const earnsLessThan10Smmlv = baseIndemnizacion < input.smmlv * 10;
      const firstYearDays = earnsLessThan10Smmlv ? 30 : 20;
      const additionalYearDays = earnsLessThan10Smmlv ? 20 : 15;

      if (effectiveDaysContract <= 360) {
        indemnityDaysEquivalent = firstYearDays;
      } else {
        const extraDaysWorked = effectiveDaysContract - 360;
        const proportionalExtraDays = (extraDaysWorked * additionalYearDays) / 360;
        indemnityDaysEquivalent = firstYearDays + proportionalExtraDays;
      }

      amountIndemnizacion = roundCOP(indemnityDaysEquivalent * dailySalary);
      indemnityFormulaDesc = earnsLessThan10Smmlv
        ? `Ingreso < 10 SMMLV: 30 días primer año + 20 días proporcionales por fracción (${indemnityDaysEquivalent.toFixed(2)} días de salario).`
        : `Ingreso >= 10 SMMLV: 20 días primer año + 15 días proporcionales por fracción (${indemnityDaysEquivalent.toFixed(2)} días de salario).`;

    } else if (input.contractType === 'FIJO') {
      if (!input.expectedEndDate) throw new Error('Para contrato a término fijo sin justa causa debe indicar expectedEndDate.');
      const remainingDays = Math.max(0, calculateDays360(input.endDate, input.expectedEndDate) - 1);
      indemnityDaysEquivalent = remainingDays;
      amountIndemnizacion = roundCOP(remainingDays * dailySalary);
      indemnityFormulaDesc = `Tiempo faltante para vencimiento del plazo pactado (${remainingDays} días de salario).`;

    } else if (input.contractType === 'OBRA_LABOR') {
      const remainingDays = input.expectedEndDate ? Math.max(0, calculateDays360(input.endDate, input.expectedEndDate) - 1) : 15;
      indemnityDaysEquivalent = Math.max(15, remainingDays);
      amountIndemnizacion = roundCOP(indemnityDaysEquivalent * dailySalary);
      indemnityFormulaDesc = `Lapso determinado por la duración de la obra con mínimo legal de 15 días (${indemnityDaysEquivalent} días de salario).`;
    }
  }

  const totalPrestaciones = amountCesantias + amountIntereses + amountPrima + amountVacaciones;
  const grandTotal = totalPrestaciones + amountIndemnizacion;

  return {
    summary: {
      totalDaysContract,
      effectiveDaysContract,
      appliesTransportAllowance,
      totalPrestaciones,
      totalIndemnizacion: amountIndemnizacion,
      grandTotal,
    },
    breakdown: {
      cesantias: { amount: amountCesantias, days: daysCesantias, baseSalaryUsed: basePrestacional, legalBasis: 'Art. 249 CST', formulaDescription: `($${basePrestacional.toLocaleString('es-CO')} × ${daysCesantias} días) / 360` },
      interesesCesantias: { amount: amountIntereses, days: daysCesantias, baseSalaryUsed: amountCesantias, legalBasis: 'Ley 52 de 1975 (Art. 1)', formulaDescription: `($${amountCesantias.toLocaleString('es-CO')} × ${daysCesantias} días × 12%) / 360` },
      primaServicios: { amount: amountPrima, days: daysPrima, baseSalaryUsed: basePrestacional, legalBasis: 'Art. 306 CST', formulaDescription: `($${basePrestacional.toLocaleString('es-CO')} × ${daysPrima} días) / 360` },
      vacaciones: { amount: amountVacaciones, days: effectiveDaysContract, accruedDays: Number(accruedVacationDays.toFixed(2)), pendingDays: Number(pendingVacationDays.toFixed(2)), baseSalaryUsed: baseVacaciones, legalBasis: 'Art. 186 y 189 CST', formulaDescription: `${pendingVacationDays.toFixed(2)} días hábiles pendientes × ($${baseVacaciones.toLocaleString('es-CO')} / 30)` },
      indemnizacion: { amount: amountIndemnizacion, days: Number(indemnityDaysEquivalent.toFixed(2)), baseSalaryUsed: baseIndemnizacion, legalBasis: 'Art. 64 CST', formulaDescription: indemnityFormulaDesc },
    },
    moratoriaReference: {
      dailyRate: roundCOP(ordinarySalary / 30),
      legalNote: 'Art. 65 CST: Un día de salario por cada día de retardo hasta por 24 meses (o intereses moratorios a la tasa máxima de la Superfinanciera a partir del mes 25 si devenga más de 1 SMMLV).',
    },
  };
}