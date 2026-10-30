// ==================== SISTEMA DE ALMACENAMIENTO ====================
let activities = JSON.parse(localStorage.getItem('activities')) || [
    { id: 'ACT001', title: 'Present Simple Exercise', type: 'Grammar', level: 'A2', points: 100, students: 45 },
    { id: 'ACT002', title: 'Reading Comprehension - Travel', type: 'Reading', level: 'B1', points: 80, students: 32 },
    { id: 'ACT003', title: 'Listening Practice - Daily Routines', type: 'Listening', level: 'A2', points: 50, students: 28 },
    { id: 'ACT004', title: 'Vocabulary Quiz - Food & Drinks', type: 'Quiz', level: 'A1', points: 100, students: 51 }
];

let selectedActivityIndex = null;

function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
}

// ==================== RENDERIZADO ====================
function renderActivitiesList() {
    const listContainer = document.querySelector('.activities-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    activities.forEach((activity, index) => {
        const activityEl = document.createElement('div');
        activityEl.style.cssText = 'background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s;';
        activityEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="flex: 1;">
          <h4 style="color: #1f2937; margin: 0 0 8px 0; font-weight: 600;">${activity.title}</h4>
          <div style="display: flex; gap: 16px; font-size: 14px; color: #666;">
            <span style="display: flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
              </svg>
              ${activity.type}
            </span>
            <span>Nivel: ${activity.level}</span>
            <span>Puntos: ${activity.points}</span>
          </div>
        </div>
        <button class="edit-btn" data-index="${index}" style="background: #1773b0; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 6px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 21h8"></path>
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
          </svg>
          Editar
        </button>
      </div>
    `;
        listContainer.appendChild(activityEl);
    });
}

// ==================== EDICIÓN ====================
function showEditForm(index) {
    selectedActivityIndex = index;
    const activity = activities[index];
    const editForm = document.getElementById('edit-form');
    const applyBtn = document.getElementById('apply-edit-btn');

    document.getElementById('edit-activity-name').textContent = activity.title;
    document.getElementById('edit-title').value = activity.title;
    document.getElementById('edit-type').value = activity.type;
    document.getElementById('edit-level').value = activity.level;
    document.getElementById('edit-points').value = activity.points;
    document.getElementById('edit-description').value = activity.description || '';

    editForm.style.display = 'block';
    applyBtn.style.display = 'flex';
}

function hideEditForm() {
    document.getElementById('edit-form').style.display = 'none';
    document.getElementById('apply-edit-btn').style.display = 'none';
    selectedActivityIndex = null;
}

function saveChanges() {
    if (selectedActivityIndex === null) return;

    activities[selectedActivityIndex].title = document.getElementById('edit-title').value;
    activities[selectedActivityIndex].type = document.getElementById('edit-type').value;
    activities[selectedActivityIndex].level = document.getElementById('edit-level').value;
    activities[selectedActivityIndex].points = parseInt(document.getElementById('edit-points').value);
    activities[selectedActivityIndex].description = document.getElementById('edit-description').value;

    saveActivities();
    alert('✅ Actividad actualizada correctamente');
    hideEditForm();
    renderActivitiesList();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function () {
    renderActivitiesList();

    // Edit button clicks
    document.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const index = parseInt(editBtn.dataset.index);
            showEditForm(index);
        }
    });

    // Cancel button
    document.getElementById('cancel-edit-btn')?.addEventListener('click', hideEditForm);

    // Apply changes button
    document.getElementById('apply-edit-btn')?.addEventListener('click', saveChanges);

    // Search functionality
    document.getElementById('search-modify')?.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.activities-list > div');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
});
