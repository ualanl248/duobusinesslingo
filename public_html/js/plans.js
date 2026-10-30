
document.addEventListener('DOMContentLoaded', () => {
    fetchPlans();
});

async function fetchPlans() {
    const plansContainer = document.getElementById('plans-grid');
    if (!plansContainer) return;

    try {
        // Use apiUrl helper from config.js to get the correct URL for environment
        const response = await fetch(apiUrl('planes-public'));
        if (!response.ok) throw new Error('Error al cargar planes');

        const result = await response.json();

        // The API wraps the response in a 'data' property if using standard responseJsonOk
        const data = result.data || result;

        if (data.success && data.planes && data.planes.length > 0) {
            renderPlans(data.planes, plansContainer);
        } else {
            plansContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">No hay planes disponibles en este momento.</p>';
        }

    } catch (error) {
        console.error('Error fetching plans:', error);
        plansContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">Hubo un error al cargar los planes. Por favor intenta más tarde.</p>';
    }
}

function renderPlans(planes, container) {
    container.innerHTML = '';

    // Check if user is logged in
    const token = localStorage.getItem('jwt_token');
    const ctaText = token ? 'Suscribirse' : 'Comenzar';
    const ctaLink = token ? './FrontendCliente/index.html#suscripciones' : './register.html';

    planes.forEach(plan => {
        const isBestValue = plan.nombre.toLowerCase().includes('anual') || plan.duracion_dias == 365;

        const card = document.createElement('div');
        card.className = `plan-card ${isBestValue ? 'highlight' : ''}`;

        // Formatter currency
        const formatter = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        });

        // Parse description features
        const features = plan.descripcion ? plan.descripcion.split('.').filter(f => f.trim().length > 0) : ['Acceso completo', 'Soporte prioritario'];

        card.innerHTML = `
            ${isBestValue ? '<div class="badge-best">Mejor valor</div>' : ''}
            <div class="plan-header">
                <h3>${plan.nombre}</h3>
                <div class="plan-price">
                    <span class="currency">${formatter.format(plan.precio)}</span>
                    <span class="period">/${getPeriodLabel(plan.duracion_dias)}</span>
                </div>
                <p class="plan-desc">Perfecto para ${getTargetAudience(plan.duracion_dias)}</p>
            </div>
            
            <ul class="plan-features">
                ${features.map(feature => `<li><span class="check">✓</span> ${feature}</li>`).join('')}
                <li><span class="check">✓</span> Acceso ilimitado</li>
                <li><span class="check">✓</span> Certificado de logro</li>
            </ul>

            <a href="${ctaLink}" class="btn ${isBestValue ? 'primary' : 'outline'} full-width">${ctaText}</a>
        `;

        container.appendChild(card);
    });
}

function getPeriodLabel(days) {
    if (days == 30) return 'mes';
    if (days == 90) return 'trimestre';
    if (days == 365) return 'año';
    return `${days} días`;
}

function getTargetAudience(days) {
    if (days == 30) return 'probar la plataforma';
    if (days == 90) return 'aprender a corto plazo';
    if (days == 365) return 'dominar el idioma';
    return 'estudiantes dedicados';
}
