const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getAddUser,
    postAddUser,
    postEditUser,
    deactivateUser,
    getEditUser,
    deleteUser
} = require('../controllers/authController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Only accessible by authenticated admin users
router.get('/users', getAllUsers);
router.get('/users/new',getAddUser);
router.post('/users/new', postAddUser);
router.get('/users/edit/', getEditUser);
router.post('/users/edit/', postEditUser);
router.post('/users/deactivate/:id', deactivateUser);
router.post('/users/:id/delete', deleteUser);

// router.get('/users', isAuthenticated, isAdmin, getAllUsers);
// router.get('/users/new', isAuthenticated, isAdmin, getAddUser);
// router.post('/users/new', isAuthenticated, isAdmin, postAddUser);
// router.get('/users/edit/:id', isAuthenticated, isAdmin, getEditUser);
// router.post('/users/edit/:id', isAuthenticated, isAdmin, postEditUser);
// router.post('/users/deactivate/:id', isAuthenticated, isAdmin, deactivateUser);
// router.post('/admin/users/:id/delete', isAuthenticated, isAdmin, deleteUser);

module.exports = router;
