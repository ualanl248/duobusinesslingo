// difusion.js - Crear y Gestionar Listas de Difusión
 (function(){
  const container = document.getElementById('content-area');

  // Mock lists and members (fallback)
  let mockLists = [
    { id: 'L1001', name: 'Comunicados Generales', desc: 'Para anuncios generales', membersCount: 120, members: [
      { id: 'U1', name: 'Ana Pérez', email: 'ana@ejemplo.com' },
      { id: 'U2', name: 'Luis Gómez', email: 'luis@ejemplo.com' }
    ]},
    { id: 'L1002', name: 'Profesores', desc: 'Lista solo profesores', membersCount: 45, members: [
      { id: 'U10', name: 'Marta Ruiz', email: 'mruiz@ejemplo.com' }
    ]},
    { id: 'L1003', name: 'Padres', desc: 'Comunicaciones a padres', membersCount: 200, members: [] }
  ];

    // Store local history in session or just memory
    let mockHistory = []; 

    async function sendBroadcast(payload) {
        // Direct fetch
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('token'); 
        const res = await fetch('https://api.duobusinesslingo.com/difusion/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Error enviando correo');
        
        // Add to local history
        const newItem = {
            id: 'H' + Date.now(),
            subject: payload.subject,
            filters: payload.filters,
            sentCount: data.data.sent,
            failedCount: data.data.failed,
            date: new Date().toLocaleString()
        };
        mockHistory.unshift(newItem);
        return newItem;
    }

    // UI rendering
    function renderLayout(){
        if(!container) return;
        container.innerHTML = `
        <div class="dashboard-header">
            <h2>Historial de correos de difusión</h2>
            <p>Envía correos masivos a tus usuarios y revisa el historial de la sesión.</p>
        </div>


        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
            <div class="card" id="d-create-card">
            <h3 style="margin: 0 0 12px 0;">Enviar nuevo correo</h3>
            <div style="margin-bottom: 8px;">
                <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Asunto</label>
                <input id="d-name" placeholder="Asunto del correo..." style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Mensaje</label>
                <textarea id="d-desc" rows="5" placeholder="Escribe tu mensaje aquí..." style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Destinatarios</label>
                <div style="background: white; border: 1px solid #ddd; border-radius: 4px; padding: 8px;">
                <div><label><input type="radio" name="recipient-filter" id="d-all" /> Todos los usuarios</label></div>
                <div><label><input type="radio" name="recipient-filter" id="d-leads" /> Leads (Sin suscripción)</label></div>
                <div><label><input type="radio" name="recipient-filter" id="d-clients" /> Clientes (Con suscripción)</label></div>
                <div><label><input type="radio" name="recipient-filter" id="d-admins" /> Administradores</label></div>
                </div>
            </div>
            <button id="d-send-btn" class="btn btn-primary" style="width: 100%; background: #16a34a; color: white;">Enviar Correo</button>
            <div id="d-send-status" style="margin-top:8px; font-size:13px;"></div>
            </div>

            <div class="card" id="d-history-card">
            <h3 style="margin: 0 0 12px 0;">Historial (Sesión actual)</h3>
            <div id="d-history-area">
                <div style="color:#999;font-style:italic">No se han enviado correos todavía.</div>
            </div>
            </div>
        </div>
        
        `;
    }

    function renderHistory(){
        const area = document.getElementById('d-history-area');
        if(!area) return;
        if(mockHistory.length === 0){
            area.innerHTML = '<div style="color:#999;font-style:italic">No se han enviado correos todavía.</div>';
            return;
        }

        area.innerHTML = mockHistory.map(h => `
        <div style="border:1px solid #eee;border-radius:4px;padding:10px;margin-bottom:8px;background:#f9f9f9">
            <div style="font-weight:600;color:#333;margin-bottom:4px;">${h.subject}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px">
            Enviados: <b>${h.sentCount}</b> | Fallidos: <span style="color:#c33">${h.failedCount}</span>
            </div>
            <div style="font-size:11px;color:#999">${h.date}</div>
        </div>
        `).join('');
    }

    function attachMainHandlers(){
        const sendBtn = document.getElementById('d-send-btn');
        if(sendBtn) sendBtn.addEventListener('click', async () => {
             const subject = document.getElementById('d-name').value.trim();
             const message = document.getElementById('d-desc').value.trim();
             const status = document.getElementById('d-send-status');
             
             const filters = {
                 all: document.getElementById('d-all').checked,
                 leads: document.getElementById('d-leads').checked,
                 clients: document.getElementById('d-clients').checked,
                 admins: document.getElementById('d-admins').checked
             };

             if(!subject){ alert('Falta el asunto'); return; }
             if(!message){ alert('Falta el mensaje'); return; }
             if(!filters.all && !filters.leads && !filters.clients && !filters.admins){
                 alert('Selecciona al menos un grupo de destinatarios');
                 return;
             }

             if(!confirm('¿Estás seguro de enviar este correo masivo?')) return;

             try{
                 sendBtn.disabled = true;
                 status.textContent = 'Enviando... (esto puede tomar unos segundos)';
                 status.style.color = '#666';
                 
                 await sendBroadcast({ subject, message, filters });
                 
                 status.textContent = 'Envío completado.';
                 status.style.color = 'green';
                 
                 // Clear form
                 document.getElementById('d-name').value = '';
                 document.getElementById('d-desc').value = '';
                 
                 renderHistory();
             }catch(err){
                 console.error(err);
                 status.textContent = 'Error: ' + err.message;
                 status.style.color = 'red';
             }finally{
                 sendBtn.disabled = false;
             }
        });

    }

    function init(){
        renderLayout();
        setTimeout(attachMainHandlers, 100);
    }
    
    // Legacy support not really needed for this new feature but keeping structure
    window.__DIFUSION = { init };

    init();
})();
