const glossaryContainer = document.getElementById('awsGlossary');
const searchInput = document.getElementById('searchInput');
const toggleModeBtn = document.getElementById('toggleMode');
const categorySelect = document.getElementById('categorySelect');
const body = document.body;
let allData = [];

// Modo oscuro
toggleModeBtn.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  toggleModeBtn.textContent = body.classList.contains('dark-mode')
    ? '☀️ Modo claro'
    : '🌙 Modo oscuro';
});

// Cargar JSON
fetch('servicios.json')
  .then(res => res.json())
  .then(data => {
    allData = data.categories;
    loadCategoryOptions();
    renderCategories(allData);
  })
  .catch(() => {
    glossaryContainer.innerHTML =
      '<p class="text-danger">Error cargando servicios.json</p>';
  });

// Cargar selector de categorías
function loadCategoryOptions() {
  allData.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });
}

// Renderizar categorías
function renderCategories(categories) {
  glossaryContainer.innerHTML = '';

  categories.forEach((category, catIndex) => {
    const categoryBlock = document.createElement('div');

    // Título colapsable de categoría
    const categoryHeader = document.createElement('button');
    categoryHeader.classList.add(
      'btn',
      'btn-warning',
      'w-100',
      'text-start',
      'mb-2',
      'fw-bold',
      'text-black'
    );
    categoryHeader.setAttribute('data-bs-toggle', 'collapse');
    categoryHeader.setAttribute('data-bs-target', `#cat${catIndex}`);
    categoryHeader.textContent = category.name;
    categoryBlock.appendChild(categoryHeader);

    // Contenido interno
    const collapseDiv = document.createElement('div');
    collapseDiv.id = `cat${catIndex}`;
    collapseDiv.classList.add('collapse');
    collapseDiv.setAttribute('data-bs-parent', '#categoriesContainer');

    const accordion = document.createElement('div');
    accordion.classList.add('accordion');
    accordion.id = `accordion${catIndex}`;

    category.services.forEach((service, index) => {
      const id = `cat${catIndex}serv${index}`;
      const card = document.createElement('div');
      card.classList.add('accordion-item', 'aws-card');

      card.innerHTML = `
        <h2 class="accordion-header" id="heading${id}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${id}" aria-expanded="false">
            ${service.name}
          </button>
        </h2>
        <div id="collapse${id}" class="accordion-collapse collapse" data-bs-parent="#accordion${catIndex}">
          <div class="accordion-body">
            <p>${service.description}</p>
            ${service.image ? `<img src="${service.image}" class="aws-img">` : ''}
          </div>
        </div>
      `;

      accordion.appendChild(card);
    });

    collapseDiv.appendChild(accordion);
    categoryBlock.appendChild(collapseDiv);
    glossaryContainer.appendChild(categoryBlock);
  });
}

// Filtrar por categoría
categorySelect.addEventListener('change', () => {
  const selected = categorySelect.value;

  if (selected === 'all') {
    renderCategories(allData);
    return;
  }

  const filtered = allData.filter(cat => cat.name === selected);
  renderCategories(filtered);
});

// 🔍 Búsqueda moderna
searchInput.addEventListener('input', e => {
  const term = e.target.value.trim().toLowerCase();

  if (!term) {
    renderCategories(allData);
    return;
  }

  const filteredCategories = allData
    .map(cat => ({
      ...cat,
      services: cat.services.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          (s.description || '').toLowerCase().includes(term)
      )
    }))
    .filter(cat => cat.services.length > 0);

  renderCategories(filteredCategories);

  setTimeout(() => {
    try {
      const firstCategoryCollapse = document.querySelector('#awsGlossary .collapse');
      if (firstCategoryCollapse) {
        const bsCat = bootstrap.Collapse.getOrCreateInstance(firstCategoryCollapse);
        bsCat.show();
      }

      const firstServiceCollapse = document.querySelector(
        '#awsGlossary .accordion-collapse'
      );
      if (firstServiceCollapse) {
        const bsSvc = bootstrap.Collapse.getOrCreateInstance(firstServiceCollapse);
        bsSvc.show();
        firstServiceCollapse.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('Error al autoabrir resultados de búsqueda:', err);
    }
  }, 120);
});
