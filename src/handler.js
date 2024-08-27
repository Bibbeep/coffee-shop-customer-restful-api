const { nanoid } = require('nanoid');
const menus = require('./menus');
const orders = require('./orders');

const getAllMenusHandler = (request, h) => {
    const shownMenus = menus.map((menu) => {
        const { name, price } = menu;
        return { name, price };
    });

    const response = h.response({
        status: 'success',
        data: {
            menus: shownMenus,
        },
    });
    response.code(200);
    return response;
};

const addOrderHandler = (request, h) => {
    const { items } = request.payload;
    
    const isListed = items.filter((item) => {
        return menus.findIndex((menu) => {
            return menu.name === item.name;
        }) !== -1;
    }).length === items.length;

    if (!isListed) {
        const response = h.response({
            status: 'fail',
            message: 'Pesanan gagal ditambahkan. Item yang diminta tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    const isAvailable = items.filter((item) => {
        const index = menus.findIndex((menu) => menu.name === item.name);
        
        if (menus[index].availableQty >= item.quantity) {
            menus[index].availableQty--;
            return true;
        }
        return false;
    }).length === items.length;

    if (!isAvailable) {
        const response = h.response({
            status: 'fail',
            message: 'Pesanan gagal ditambahkan. Item sedang tidak tersedia',
        });
        response.code(400);
        return response;
    }

    const orderId = nanoid(16);
    const createdAt = new Date().toISOString();
    const modifiedAt = createdAt;
    
    const totalPrice = items.reduce((sum, item) => {
        const { name, quantity } = item;
        const index = menus.findIndex((menu) => menu.name === name);
        const { price } = menus[index];
        const subtotal = price * quantity;

        return sum += subtotal;
    }, 0);

    const newOrder = {
        orderId,
        items,
        createdAt,
        modifiedAt,
        totalPrice,
    };
    orders.push(newOrder);

    const response = h.response({
        status: 'success',
        message: 'Pesanan berhasil ditambahkan',
        data: {
            orderId,
            totalPrice,
        },
    });
    response.code(201);
    return response;
}

const getAllOrdersHandler = (request, h) => {
    const shownOrders = orders.map((order) => {
        const { orderId, items, totalPrice } = order;
        return { orderId, items, totalPrice };
    });

    const response = h.response({
        status: 'success',
        data: {
            orders: shownOrders,
        },
    });
    response.code(200);
    return response;
};

const getOrderByIdHandler = (request, h) => {
    const { orderId } = request.params;
    const index = orders.findIndex((order) => order.orderId === orderId);

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: 'Pesanan tidak ditemukan. Mohon isi orderId yang tepat',
        });
        response.code(404);
        return response;
    }

    const shownOrder = orders[index];

    const response = h.response({
        status: 'success',
        data: {
            ...shownOrder,
        },
    });
    response.code(200);
    return response;
}

const editOrderByIdHandler = (request, h) => {
    const { orderId } = request.params;
    const { items } = request.payload;
    const index = orders.findIndex((order) => order.orderId === orderId);
    const modifiedAt = new Date().toISOString();

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: 'Pesanan tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    const isHasNameProperty = items.filter((item) => Object.hasOwn(item, 'name')).length === items.length;

    if (!isHasNameProperty) {
        const response = h.response({
            status: 'fail',
            message: 'Pesanan gagal diubah. Mohon isi nama item',
        });
        response.code(400);
        return response;
    }
    
    const isListedItem = items.filter((item) => {
        const { items: orderItems } = orders[index];

        return orderItems.findIndex((orderItem) => orderItem.name === item.name) !== -1;
    }).length === items.length;


    if (!isListedItem) {
        const response = h.response({
            status: 'fail',
            message: 'Pesanan gagal diubah. Mohon isi nama item yang benar',
        });
        response.code(404);
        return response;
    }

    const isAvailable = items.filter((item) => {
        const orderItemIndex = orders[index].items.findIndex((orderItem) => {
            return orderItem.name === item.name;
        });
        const menuIndex = menus.findIndex((menu) => {
            return menu.name === item.name;
        });

        const { quantity: orderItemQty } = orders[index].items[orderItemIndex];
        const { availableQty } = menus[menuIndex];
        const { quantity: editOrderItemQty } = item;

        return (editOrderItemQty <= availableQty + orderItemQty) && (editOrderItemQty >= 0);
    }).length === items.length;

    if (!isAvailable) {
        const response = h.response({
            status: 'fail',
            message: 'Pesanan gagal diubah. Jumlah item yang diminta tidak tersedia',
        });
        response.code(400);
        return response;
    }

    items.forEach((item) => {
        const orderItemIndex = orders[index].items.findIndex((orderItem) => {
            return orderItem.name === item.name;
        });
        const menuIndex = menus.findIndex((menu) => {
            return menu.name === item.name;
        });

        const { quantity: orderItemQty } = orders[index].items[orderItemIndex];
        const { availableQty } = menus[menuIndex];
        const { quantity: editOrderItemQty } = item;

        menus[menuIndex].availableQty = availableQty + orderItemQty - editOrderItemQty;
    });

    orders[index] = {
        ...orders[index],
        items,
        modifiedAt,
    };

    const totalPrice = orders[index].items.reduce((sum, item) => {
        const { name, quantity } = item;
        const menuIndex = menus.findIndex((menu) => menu.name === name);
        const { price } = menus[menuIndex];
        const subtotal = price * quantity;

        return sum += subtotal;
    }, 0);

    orders[index] = {
        ...orders[index],
        totalPrice,
    };

    const response = h.response({
        status: 'success',
        message: 'Pesanan berhasil diubah',
    });
    response.code(200);
    return response;
};

const deleteOrderByIdHandler = (request, h) => {
    const { orderId } = request.params;
    const index = orders.findIndex((order) => order.orderId === orderId);

    if (index === -1) {
        const response = h.response({
            status: 'fail',
            message: 'Pesanan tidak ditemukan',
        });
        response.code(404);
        return response;
    }

    orders.splice(index, 1);
    const isSuccess = orders.findIndex((order) => order.orderId === orderId) === -1;

    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Pesanan berhasil dihapus'
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Pesanan gagal dihapus',
    });
    response.code(500);
    return response;
};

module.exports = {
    getAllMenusHandler,
    addOrderHandler,
    getAllOrdersHandler,
    getOrderByIdHandler,
    editOrderByIdHandler,
    deleteOrderByIdHandler,
};