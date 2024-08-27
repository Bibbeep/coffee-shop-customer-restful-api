const {
    getAllMenusHandler,
    addOrderHandler,
    getAllOrdersHandler,
    getOrderByIdHandler,
    editOrderByIdHandler,
    deleteOrderByIdHandler,
} = require('./handler');

const routes = [
    {
        method: 'GET',
        path: '/menus',
        handler: getAllMenusHandler,
    },
    {
        method: 'POST',
        path: '/orders',
        handler: addOrderHandler,
    },
    {
        method: 'GET',
        path: '/orders',
        handler: getAllOrdersHandler,
    },
    {
        method: 'GET',
        path: '/orders/{orderId}',
        handler: getOrderByIdHandler,
    },
    {
        method: 'PUT',
        path: '/orders/{orderId}',
        handler: editOrderByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/orders/{orderId}',
        handler: deleteOrderByIdHandler,
    },
];

module.exports = routes;