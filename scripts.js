// Global variables
let orderCounter = 1001;
let orders = [];
let parts = [];

// DOM elements
const newOrderBtn = document.getElementById('newOrderBtn');
const orderForm = document.getElementById('orderForm');
const orderFormElement = document.getElementById('orderFormElement');
const cancelBtn = document.getElementById('cancelBtn');
const addPartBtn = document.getElementById('addPartBtn');
const partModal = document.getElementById('partModal');
const closePartModal = document.getElementById('closePartModal');
const cancelPartBtn = document.getElementById('cancelPartBtn');
const confirmPartBtn = document.getElementById('confirmPartBtn');
const partsList = document.getElementById('partsList');
const ordersTableBody = document.getElementById('ordersTableBody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
    renderOrders();
});

function initializeApp() {
    // Set current date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    // Generate initial order number
    document.getElementById('orderNumber').value = generateOrderNumber();
    
    // Event listeners
    newOrderBtn.addEventListener('click', showOrderForm);
    cancelBtn.addEventListener('click', hideOrderForm);
    addPartBtn.addEventListener('click', showPartModal);
    closePartModal.addEventListener('click', hidePartModal);
    cancelPartBtn.addEventListener('click', hidePartModal);
    confirmPartBtn.addEventListener('click', addPart);
    orderFormElement.addEventListener('submit', handleOrderSubmit);
    saveAsDraftBtn.addEventListener('click', saveAsDraft);
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', handleSearch);
    
    // Close modal when clicking outside
    partModal.addEventListener('click', function(e) {
        if (e.target === partModal) {
            hidePartModal();
        }
    });
}

function generateOrderNumber() {
    return `PED-${orderCounter.toString().padStart(6, '0')}`;
}

function showOrderForm() {
    orderForm.style.display = 'block';
    orderForm.classList.add('fade-in');
    document.getElementById('orderNumber').value = generateOrderNumber();
    orderCounter++;
}

function hideOrderForm() {
    orderForm.style.display = 'none';
    resetForm();
}

function resetForm() {
    orderFormElement.reset();
    parts = [];
    renderParts();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    document.getElementById('orderNumber').value = generateOrderNumber();
}

function showPartModal() {
    partModal.style.display = 'flex';
    partModal.classList.add('fade-in');
    // Clear modal form
    document.getElementById('partCode').value = '';
    document.getElementById('partName').value = '';
    document.getElementById('partQuantity').value = '1';
    document.getElementById('partPrice').value = '';
}

function hidePartModal() {
    partModal.style.display = 'none';
}

function addPart() {
    const partCode = document.getElementById('partCode').value.trim();
    const partName = document.getElementById('partName').value.trim();
    const partQuantity = parseInt(document.getElementById('partQuantity').value);
    const partPrice = parseFloat(document.getElementById('partPrice').value) || 0;
    
    if (!partCode || !partName || partQuantity < 1) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const part = {
        id: Date.now(),
        code: partCode,
        name: partName,
        quantity: partQuantity,
        price: partPrice,
        total: partQuantity * partPrice
    };
    
    parts.push(part);
    renderParts();
    hidePartModal();
}

function removePart(partId) {
    parts = parts.filter(part => part.id !== partId);
    renderParts();
}

function renderParts() {
    if (parts.length === 0) {
        partsList.innerHTML = '<p class="empty-state">Nenhuma peça adicionada ainda.</p>';
        return;
    }
    
    const partsHtml = parts.map(part => `
        <div class="part-item slide-in">
            <div class="part-info">
                <h5>${part.name}</h5>
                <p>Código: ${part.code} | Qtd: ${part.quantity} | Preço: R$ ${part.price.toFixed(2)} | Total: R$ ${part.total.toFixed(2)}</p>
            </div>
            <div class="part-actions">
                <button type="button" class="btn btn-danger btn-small" onclick="removePart(${part.id})">
                    <span class="icon">🗑️</span>
                    Remover
                </button>
            </div>
        </div>
    `).join('');
    
    partsList.innerHTML = partsHtml;
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(orderFormElement);
    const orderData = Object.fromEntries(formData.entries());
    
    if (parts.length === 0) {
        alert('Adicione pelo menos uma peça ao pedido.');
        return;
    }
    
    const order = {
        id: Date.now(),
        number: orderData.orderNumber,
        date: orderData.orderDate,
        customer: {
            name: orderData.customerName,
            phone: orderData.customerPhone,
            email: orderData.customerEmail
        },
        equipment: {
            model: orderData.equipmentModel,
            serialNumber: orderData.serialNumber
        },
        priority: orderData.priority,
        description: orderData.description,
        parts: [...parts],
        status: 'pending',
        total: parts.reduce((sum, part) => sum + part.total, 0),
        createdAt: new Date().toISOString()
    };
    
    orders.unshift(order);
    renderOrders();
    hideOrderForm();
    
    alert('Pedido salvo com sucesso!');
}

function saveAsDraft() {
    const formData = new FormData(orderFormElement);
    const orderData = Object.fromEntries(formData.entries());
    
    const order = {
        id: Date.now(),
        number: orderData.orderNumber,
        date: orderData.orderDate,
        customer: {
            name: orderData.customerName || 'Cliente não informado',
            phone: orderData.customerPhone || '',
            email: orderData.customerEmail || ''
        },
        equipment: {
            model: orderData.equipmentModel || '',
            serialNumber: orderData.serialNumber || ''
        },
        priority: orderData.priority || 'baixa',
        description: orderData.description || '',
        parts: [...parts],
        status: 'draft',
        total: parts.reduce((sum, part) => sum + part.total, 0),
        createdAt: new Date().toISOString()
    };
    
    orders.unshift(order);
    renderOrders();
    hideOrderForm();
    
    alert('Rascunho salvo com sucesso!');
}

function renderOrders() {
    if (orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <h4>Nenhum pedido encontrado</h4>
                    <p>Clique em "Novo Pedido" para começar.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const ordersHtml = orders.map(order => `
        <tr class="slide-in">
            <td><strong>${order.number}</strong></td>
            <td>${formatDate(order.date)}</td>
            <td>
                <div>
                    <strong>${order.customer.name}</strong>
                    ${order.customer.phone ? `<br><small>${order.customer.phone}</small>` : ''}
                </div>
            </td>
            <td>${order.equipment.model || '-'}</td>
            <td>
                <span class="status-badge status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td>
                <span class="priority-badge priority-${order.priority}">
                    ${getPriorityText(order.priority)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewOrder(${order.id})">
                        <span class="icon">👁️</span>
                        Ver
                    </button>
                    <button class="btn btn-primary btn-small" onclick="editOrder(${order.id})">
                        <span class="icon">✏️</span>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteOrder(${order.id})">
                        <span class="icon">🗑️</span>
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    ordersTableBody.innerHTML = ordersHtml;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getStatusText(status) {
    const statusMap = {
        'draft': 'Rascunho',
        'pending': 'Pendente',
        'processing': 'Processando',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
}

function getPriorityText(priority) {
    const priorityMap = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta',
        'urgente': 'Urgente'
    };
    return priorityMap[priority] || priority;
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderOrders();
        return;
    }
    
    const filteredOrders = orders.filter(order => 
        order.number.toLowerCase().includes(searchTerm) ||
        order.customer.name.toLowerCase().includes(searchTerm) ||
        order.equipment.model.toLowerCase().includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm) ||
        order.priority.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredOrders(filteredOrders);
}

function renderFilteredOrders(filteredOrders) {
    if (filteredOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <h4>Nenhum pedido encontrado</h4>
                    <p>Tente ajustar os termos de busca.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const ordersHtml = filteredOrders.map(order => `
        <tr class="slide-in">
            <td><strong>${order.number}</strong></td>
            <td>${formatDate(order.date)}</td>
            <td>
                <div>
                    <strong>${order.customer.name}</strong>
                    ${order.customer.phone ? `<br><small>${order.customer.phone}</small>` : ''}
                </div>
            </td>
            <td>${order.equipment.model || '-'}</td>
            <td>
                <span class="status-badge status-${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td>
                <span class="priority-badge priority-${order.priority}">
                    ${getPriorityText(order.priority)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewOrder(${order.id})">
                        <span class="icon">👁️</span>
                        Ver
                    </button>
                    <button class="btn btn-primary btn-small" onclick="editOrder(${order.id})">
                        <span class="icon">✏️</span>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteOrder(${order.id})">
                        <span class="icon">🗑️</span>
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    ordersTableBody.innerHTML = ordersHtml;
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    let partsInfo = '';
    if (order.parts && order.parts.length > 0) {
        partsInfo = order.parts.map(part => 
            `• ${part.name} (${part.code}) - Qtd: ${part.quantity} - R$ ${part.price.toFixed(2)}`
        ).join('\n');
    } else {
        partsInfo = 'Nenhuma peça adicionada';
    }
    
    const orderInfo = `
PEDIDO: ${order.number}
DATA: ${formatDate(order.date)}
STATUS: ${getStatusText(order.status)}
PRIORIDADE: ${getPriorityText(order.priority)}

CLIENTE:
Nome: ${order.customer.name}
Telefone: ${order.customer.phone || 'Não informado'}
E-mail: ${order.customer.email || 'Não informado'}

EQUIPAMENTO:
Modelo: ${order.equipment.model || 'Não informado'}
Série: ${order.equipment.serialNumber || 'Não informado'}

DESCRIÇÃO:
${order.description || 'Nenhuma descrição fornecida'}

PEÇAS:
${partsInfo}

TOTAL: R$ ${order.total.toFixed(2)}
    `;
    
    alert(orderInfo);
}

function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Fill form with order data
    document.getElementById('orderNumber').value = order.number;
    document.getElementById('orderDate').value = order.date;
    document.getElementById('customerName').value = order.customer.name;
    document.getElementById('customerPhone').value = order.customer.phone;
    document.getElementById('customerEmail').value = order.customer.email;
    document.getElementById('equipmentModel').value = order.equipment.model;
    document.getElementById('serialNumber').value = order.equipment.serialNumber;
    document.getElementById('priority').value = order.priority;
    document.getElementById('description').value = order.description;
    
    // Load parts
    parts = [...order.parts];
    renderParts();
    
    // Show form
    showOrderForm();
    
    // Remove original order (will be re-added when saved)
    orders = orders.filter(o => o.id !== orderId);
}

function deleteOrder(orderId) {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        orders = orders.filter(o => o.id !== orderId);
        renderOrders();
        alert('Pedido excluído com sucesso!');
    }
}

function loadSampleData() {
    // Add some sample orders for demonstration
    const sampleOrders = [
        {
            id: 1,
            number: 'PED-001000',
            date: '2024-01-15',
            customer: {
                name: 'João Silva',
                phone: '(11) 99999-9999',
                email: 'joao@email.com'
            },
            equipment: {
                model: 'TC-300',
                serialNumber: 'TC300-2023-001'
            },
            priority: 'alta',
            description: 'Problema no display principal',
            parts: [
                {
                    id: 1,
                    code: 'DSP-001',
                    name: 'Display LCD 7"',
                    quantity: 1,
                    price: 250.00,
                    total: 250.00
                }
            ],
            status: 'processing',
            total: 250.00,
            createdAt: '2024-01-15T10:30:00.000Z'
        },
        {
            id: 2,
            number: 'PED-001001',
            date: '2024-01-16',
            customer: {
                name: 'Maria Santos',
                phone: '(11) 88888-8888',
                email: 'maria@email.com'
            },
            equipment: {
                model: 'TC-500',
                serialNumber: 'TC500-2023-045'
            },
            priority: 'media',
            description: 'Substituição de componentes eletrônicos',
            parts: [
                {
                    id: 2,
                    code: 'CAP-001',
                    name: 'Capacitor 100uF',
                    quantity: 3,
                    price: 15.00,
                    total: 45.00
                },
                {
                    id: 3,
                    code: 'RES-001',
                    name: 'Resistor 10K',
                    quantity: 5,
                    price: 2.00,
                    total: 10.00
                }
            ],
            status: 'completed',
            total: 55.00,
            createdAt: '2024-01-16T14:20:00.000Z'
        }
    ];
    
    orders = sampleOrders;
    orderCounter = 1002;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N for new order
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (orderForm.style.display === 'none' || !orderForm.style.display) {
            showOrderForm();
        }
    }
    
    // Escape to close modals/forms
    if (e.key === 'Escape') {
        if (partModal.style.display === 'flex') {
            hidePartModal();
        } else if (orderForm.style.display === 'block') {
            hideOrderForm();
        }
    }
});

// Form validation
function validateForm() {
    const requiredFields = [
        'customerName',
        'customerPhone',
        'equipmentModel',
        'serialNumber',
        'priority'
    ];
    
    let isValid = true;
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#e53e3e';
            isValid = false;
        } else {
            field.style.borderColor = '#e2e8f0';
        }
    });
    
    return isValid;
}

// Add form validation to submit handler
orderFormElement.addEventListener('submit', function(e) {
    if (!validateForm()) {
        e.preventDefault();
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
});

// Real-time validation
document.querySelectorAll('input[required], select[required]').forEach(field => {
    field.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.style.borderColor = '#e53e3e';
        } else {
            this.style.borderColor = '#e2e8f0';
        }
    });
});

console.log('Telecontrol System initialized successfully!');