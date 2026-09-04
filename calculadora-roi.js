(() => {
  const ids = ['volume','minutes','hourCost','automationRate','lostLeads','leadValue'];
  const els = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  const hoursCurrent = document.getElementById('hoursCurrent');
  const hoursSaved = document.getElementById('hoursSaved');
  const costSaved = document.getElementById('costSaved');
  const revenueOpportunity = document.getElementById('revenueOpportunity');
  const summary = document.getElementById('summary');
  const roiWhatsapp = document.getElementById('roiWhatsapp');

  const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  const number = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

  function val(id) {
    return Math.max(0, Number(els[id]?.value || 0));
  }

  function calculate() {
    const volume = val('volume');
    const minutes = val('minutes');
    const hourCost = val('hourCost');
    const rate = Math.min(100, val('automationRate')) / 100;
    const lostLeads = val('lostLeads');
    const leadValue = val('leadValue');

    const currentHours = (volume * minutes) / 60;
    const savedHours = currentHours * rate;
    const savedCost = savedHours * hourCost;
    const opportunity = lostLeads * leadValue;

    hoursCurrent.textContent = `${number.format(currentHours)} h`;
    hoursSaved.textContent = `${number.format(savedHours)} h`;
    costSaved.textContent = money.format(savedCost);
    revenueOpportunity.textContent = money.format(opportunity);
    summary.textContent = `Con estos supuestos, el proceso consume aproximadamente ${number.format(currentHours)} horas al mes. Si el ${number.format(rate * 100)}% pudiera automatizarse de forma segura, habría hasta ${number.format(savedHours)} horas mensuales para reasignar a trabajo de mayor valor.`;

    const msg = `Hola, hice la calculadora ROI de ARVI. Mi proceso tiene aprox. ${volume} tareas/conversaciones al mes, ${minutes} min por tarea, costo hora ${money.format(hourCost)} y estimé ${number.format(rate * 100)}% automatizable. La calculadora estimó ${number.format(savedHours)} horas potencialmente liberables al mes (${money.format(savedCost)} de costo operativo). Quiero revisar si este proceso sí vale la pena automatizar.`;
    roiWhatsapp.href = `https://wa.me/573183074381?text=${encodeURIComponent(msg)}`;
  }

  ids.forEach((id) => els[id]?.addEventListener('input', calculate));
  calculate();
})();
