document.addEventListener('DOMContentLoaded', () => {
            const messagesContainer = document.getElementById('messages');
            const ordersContainer = document.getElementById('orders');

            function renderMessages() {
                const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
                messagesContainer.innerHTML = ''; 
                messages.forEach((contact, index) => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message';
                    messageDiv.innerHTML = `
                        <strong>${contact.name}</strong> (${contact.email})<br>
                        <p>${contact.message}</p>
                        <small>${contact.date}</small>
                        <button class="deleteBtn" data-type="message" data-index="${index}">Supprimer</button>
                    `;
                    messagesContainer.appendChild(messageDiv);
                });
            }

            function renderOrders() {
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                ordersContainer.innerHTML = ''; 
                orders.forEach((order, index) => {
                    const orderDiv = document.createElement('div');
                    orderDiv.className = 'order';
                    orderDiv.innerHTML = `
                        <strong>${order.name}</strong><br>
                        <p>Numéro de téléphone: ${order.phone}</p>
                        <p>Adresse: ${order.address}</p>
                        <p>Items: ${order.items.join(', ')}</p>
                        <p><strong>Total: ${order.total}</strong></p>
                        <small>${order.date}</small>
                        <button class="deleteBtn" data-type="order" data-index="${index}">Supprimer</button>
                    `;
                    ordersContainer.appendChild(orderDiv);
                });
            }

            
            document.getElementById('refreshMessagesBtn').addEventListener('click', () => {
                renderMessages();
            });

           
            document.getElementById('refreshOrdersBtn').addEventListener('click', () => {
                renderOrders();
            });

           
            renderMessages();
            renderOrders();

            
            document.querySelectorAll('.deleteBtn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const type = e.target.getAttribute('data-type');
                    const index = e.target.getAttribute('data-index');
                    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
                    const orders = JSON.parse(localStorage.getItem('orders')) || [];

                    if (type === 'message') {
                        messages.splice(index, 1); 
                        localStorage.setItem('contactMessages', JSON.stringify(messages));
                    } else if (type === 'order') {
                        orders.splice(index, 1); 
                        localStorage.setItem('orders', JSON.stringify(orders));
                    }

                    
                    renderMessages();
                    renderOrders();
                });
            });

            
            document.getElementById('clearMessagesBtn').addEventListener('click', () => {
                localStorage.removeItem('contactMessages');
                renderMessages(); 
            });

            
            document.getElementById('clearOrdersBtn').addEventListener('click', () => {
                localStorage.removeItem('orders');
                renderOrders(); 
            });
        });