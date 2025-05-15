import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const productService = {
    // Get all products with pagination
    getAllProducts: async (pageNumber = 0, pageSize = 10, sortBy = 'id', sortOrder = 'asc') => {
        const response = await axios.get(`${API_URL}/public/products`, {
            params: {
                pageNumber,
                pageSize,
                sortBy,
                sortOrder
            }
        });
        return response.data;
    },

    // Get a single product by ID
    getProductById: async (productId) => {
        const response = await axios.get(`${API_URL}/public/products/${productId}`);
        return response.data;
    },

    // Create a new product
    createProduct: async (product, categoryId) => {
        const response = await axios.post(`${API_URL}/admin/categories/${categoryId}/products`, product);
        return response.data;
    },

    // Update a product
    updateProduct: async (productId, product) => {
        const response = await axios.put(`${API_URL}/admin/products/${productId}`, product);
        return response.data;
    },

    // Update product image
    updateProductImage: async (productId, image) => {
        const formData = new FormData();
        formData.append('image', image);
        const response = await axios.put(`${API_URL}/admin/products/${productId}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Delete a product
    deleteProduct: async (productId) => {
        const response = await axios.delete(`${API_URL}/admin/products/${productId}`);
        return response.data;
    },

    // Search products by keyword
    searchProducts: async (keyword, categoryId = 0, pageNumber = 0, pageSize = 10, sortBy = 'id', sortOrder = 'asc') => {
        const response = await axios.get(`${API_URL}/public/products/keyword/${keyword}`, {
            params: {
                categoryId,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder
            }
        });
        return response.data;
    },

    // Get products by category
    getProductsByCategory: async (categoryId, pageNumber = 0, pageSize = 10, sortBy = 'id', sortOrder = 'asc') => {
        const response = await axios.get(`${API_URL}/public/categories/${categoryId}/products`, {
            params: {
                pageNumber,
                pageSize,
                sortBy,
                sortOrder
            }
        });
        return response.data;
    },

    // Get product image URL
    getProductImageUrl: (fileName) => {
        return `${API_URL}/public/products/image/${fileName}`;
    }
};

export default productService; 