const productNameInput = document.querySelector('.product-name');
const purchaseBtn = document.querySelector('.purchase-btn');
const productsContainer = document.querySelector('.products');

const leftListSection = document.querySelector('.purchases-left');
const boughtListSection = document.querySelector('.purch-bought');

const syncStorage = () => {
    let itemsHTML = "";
    const currentItems = productsContainer.querySelectorAll('.product-item');
    currentItems.forEach(item => {
        itemsHTML += item.outerHTML;
    });
    
    localStorage.setItem('cartItemsHTML', itemsHTML);
    localStorage.setItem('leftStatsHTML', leftListSection.innerHTML);
    localStorage.setItem('boughtStatsHTML', boughtListSection.innerHTML);
};

const restoreState = () => {
    if (localStorage.getItem('cartItemsHTML')) {
        const currentItems = productsContainer.querySelectorAll('.product-item');
        currentItems.forEach(item => item.remove());
        productsContainer.insertAdjacentHTML('beforeend', localStorage.getItem('cartItemsHTML'));
        leftListSection.innerHTML = localStorage.getItem('leftStatsHTML');
        boughtListSection.innerHTML = localStorage.getItem('boughtStatsHTML');
    }
};

restoreState();

const createNewItem = () => {
    const title = productNameInput.value.trim();
    if (title === "") {
        return;
    }
    const newItemNode = document.createElement('div');
    newItemNode.className = 'product-item';

    newItemNode.innerHTML = `
        <span class="item-name" title="Клікніть для редагування">${title}</span>
        <div class="item-actions">
            <button class="btn-minus" data-tooltip="Decrease amount" style="opacity: 0.5;" disabled>-</button>
            <span class="quantity">1</span>
            <button class="btn-plus" data-tooltip="Increase amount">+</button>
        </div>
        <div class="item-status">
            <span class="btn-status">Not in a cart</span>
            <button class="btn-delete" data-tooltip="Delete product">×</button>
        </div>
    `;

    productsContainer.appendChild(newItemNode);

    const statBadge = document.createElement('div');
    statBadge.className = 'items-left';
    statBadge.innerHTML = `<span>${title}</span> <span class="quantity-left">1</span>`;
    leftListSection.appendChild(statBadge);
    productNameInput.value = '';
    productNameInput.focus();
    syncStorage();
};

purchaseBtn.addEventListener('click', createNewItem);

productNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createNewItem();
});

const handleCartInteractions = (e) => {
    const rowElement = e.target.closest('.product-item');
    if (!rowElement) return;

    const nameElement = rowElement.querySelector('.item-name');
    if (!nameElement) return;

    const productTitle = nameElement.textContent.trim();

    let matchingBadge = null;
    const allBadges = document.querySelectorAll('.items-left, .items-bought');
    
    for (let k = 0; k < allBadges.length; k++) {
        if (allBadges[k].firstElementChild.textContent.trim() === productTitle) {
            matchingBadge = allBadges[k];
            break;
        }
    }

    if (e.target.classList.contains('item-name')) {
        const currentStatus = rowElement.querySelector('.btn-status').textContent;
        if (currentStatus === 'Already in a cart') return; 

        const oldText = e.target.textContent;

        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = oldText;
        
        editInput.style.cssText = 'width: 100%; max-width: 120px; font-family: inherit; font-size: inherit; border: 1px solid #ccc; border-radius: 3px; padding: 2px;';

        e.target.replaceWith(editInput);
        editInput.focus();

        const applyNewName = () => {
            const newText = editInput.value.trim() || oldText;
            nameElement.textContent = newText;
            editInput.replaceWith(nameElement);
            if (matchingBadge) {
                matchingBadge.firstElementChild.textContent = newText;
            }
            syncStorage();
        };
        editInput.addEventListener('blur', applyNewName);
        editInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') applyNewName();
        });
        return;
    }

    if (e.target.classList.contains('btn-plus')) {
        const qSpan = rowElement.querySelector('.quantity');
        let currentCount = parseInt(qSpan.textContent);
        currentCount++;
        qSpan.textContent = currentCount;
        if (currentCount > 1) {
            const minusBtn = rowElement.querySelector('.btn-minus');
            minusBtn.disabled = false;
            minusBtn.style.opacity = '1';
        }
        if (matchingBadge) {
            matchingBadge.lastElementChild.textContent = currentCount;
        }
        syncStorage();
    }

    if (e.target.classList.contains('btn-minus')) {
        const qSpan = rowElement.querySelector('.quantity');
        let currentCount = parseInt(qSpan.textContent);
        if (currentCount > 1) {
            currentCount--;
            qSpan.textContent = currentCount;
            if (currentCount === 1) {
                e.target.disabled = true;
                e.target.style.opacity = '0.5';
            }
            if (matchingBadge) {
                matchingBadge.lastElementChild.textContent = currentCount;
            }
        }
        syncStorage();
    }

    if (e.target.classList.contains('btn-delete')) {
        rowElement.remove();
        if (matchingBadge) {
            matchingBadge.remove();
        }
        syncStorage();
        return;
    }

    if (e.target.classList.contains('btn-status')) {
        const actionsDiv = rowElement.querySelector('.item-actions');
        const deleteBtn = rowElement.querySelector('.btn-delete');
        if (e.target.textContent === 'Not in a cart') {
            e.target.textContent = 'Already in a cart';
            nameElement.style.textDecoration = 'line-through';
            actionsDiv.style.display = 'none'; 
            deleteBtn.style.display = 'none';
            if (matchingBadge) {
                matchingBadge.className = 'items-bought';
                matchingBadge.firstElementChild.style.textDecoration = 'line-through';
                matchingBadge.lastElementChild.className = 'quantity-bought';
                matchingBadge.lastElementChild.style.textDecoration = 'line-through';
                boughtListSection.appendChild(matchingBadge);
            }
        } else {
            e.target.textContent = 'Not in a cart';
            nameElement.style.textDecoration = 'none';
            actionsDiv.style.display = 'flex'; 
            deleteBtn.style.display = 'block';
            if (matchingBadge) {
                matchingBadge.className = 'items-left';
                matchingBadge.firstElementChild.style.textDecoration = 'none';
                matchingBadge.lastElementChild.className = 'quantity-left';
                matchingBadge.lastElementChild.style.textDecoration = 'none';
                leftListSection.appendChild(matchingBadge);
            }
        }
        syncStorage();
    }
};

productsContainer.addEventListener('click', handleCartInteractions);