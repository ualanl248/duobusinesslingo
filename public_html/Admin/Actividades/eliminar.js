// ==================== SISTEMA DE ALMACENAMIENTO ====================
let activities = JSON.parse(localStorage.getItem('activities')) || [
    { id: 'ACT-001', title: 'Present Simple Exercise', type: 'Grammar', level: 'A2', students: 45 },
    { id: 'ACT-002', title: 'Reading Comprehension - Travel', type: 'Reading', level: 'B1', students: 32 },
    { id: 'ACT-003', title: 'Listening Practice - Daily Routines', type: 'Listening', level: 'A2', students: 28 },
    { id: 'ACT-004', title: 'Vocabulary Quiz - Food & Drinks', type: 'Quiz', level: 'A1', students: 51 },
    { id: 'ACT-005', title: 'Writing Task - Email Format', type: 'Writing', level: 'B1', students: 19 }
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
        activityEl.className = 'activity-item';
        activityEl.dataset.index = index;
        activityEl.innerHTML = `
      <div class="activity-item-info">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span class="activity-item-badge">${activity.id}</span>
          <div class="activity-item-title" style="margin: 0;">${activity.title}</div>
        </div>
        <div class="activity-item-meta">
          <span>📄 ${activity.type}</span>
          <span>Nivel: ${activity.level}</span>
          <span style="color: #ff9800; font-weight: 500;">${activity.students} estudiantes asignados</span>
        </div>
      </div>
      <button class="btn btn-danger delete-btn" data-index="${index}">🗑️ Eliminar</button>
    `;
        listContainer.appendChild(activityEl);
    });
}

// ==================== CONFIRMACIÓN ====================
function showConfirmation(index) {
    selectedActivityIndex = index;
    const activity = activities[index];
    const confirmSection = document.getElementById('confirmation-section');

    document.getElementById('confirm-activity-title').textContent = `${activity.title} (${activity.id})`;
    document.getElementById('confirm-activity-type').textContent = activity.type;
    document.getElementById('confirm-activity-level').textContent = activity.level;
    document.getElementById('confirm-activity-students').textContent = activity.students;

    confirmSection.style.display = 'block';
    confirmSection.scrollIntoView({ behavior: 'smooth' });
}

function hideConfirmation() {
    document.getElementById('confirmation-section').style.display = 'none';
    selectedActivityIndex = null;
}

function deleteActivity() {
    if (selectedActivityIndex === null) return;

    const activity = activities[selectedActivityIndex];
    activities.splice(selectedActivityIndex, 1);
    saveActivities();

    alert(`✅ Actividad "${activity.title}" eliminada correctamente`);
    hideConfirmation();
    renderActivitiesList();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function () {
    renderActivitiesList();

    // Delete button clicks
    document.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const index = parseInt(deleteBtn.dataset.index);
            showConfirmation(index);
        }
    });

    // Cancel button
    document.getElementById('cancel-delete-btn')?.addEventListener('click', hideConfirmation);

    // Confirm delete button
    document.getElementById('confirm-delete-btn')?.addEventListener('click', deleteActivity);
});
