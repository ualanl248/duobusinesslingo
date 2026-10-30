/**
 * reviews.js
 * Carga 6 reseñas aleatorias desde la API y las muestra en el grid de reseñas
 */
(function () {
    // Escapa texto para insertarlo de forma segura en HTML (previene XSS)
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    async function loadReviews() {
        const grid = document.getElementById('reviews-grid');
        if (!grid) return;

        try {
            const response = await fetch(apiUrl('resenas/aleatorias'));

            if (!response.ok) {
                console.error('Error loading reviews:', response.status);
                grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">No se pudieron cargar las reseñas.</p>';
                return;
            }

            const data = await response.json();

            // api_rest devuelve { status: 'ok', data: [...] }
            if (data.status === 'ok' && data.data && data.data.length > 0) {
                grid.innerHTML = data.data.map(review => {
                    // Generar estrellas según valoración
                    const fullStars = '★'.repeat(Math.max(0, Math.min(5, Number(review.valoracion) || 0)));
                    const emptyStars = '☆'.repeat(5 - Math.max(0, Math.min(5, Number(review.valoracion) || 0)));
                    const stars = fullStars + emptyStars;

                    return `
            <article class="card review">
              <div class="avatar">${escapeHtml(review.initials)}</div>
              <div>
                <h4>${escapeHtml(review.nombre)}</h4>
                <div class="stars">${stars}</div>
              </div>
              <p>"${escapeHtml(review.texto)}"</p>
            </article>
          `;
                }).join('');
            } else {
                grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">Aún no hay reseñas disponibles.</p>';
            }
        } catch (error) {
            console.error('Error cargando reseñas:', error);
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">No se pudieron cargar las reseñas.</p>';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadReviews);
    } else {
        loadReviews();
    }
})();
