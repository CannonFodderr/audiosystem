module.exports = {
    isLoggedIn(req, res, next) {
        if (req.user && req.user != 'undefined') {
            return next();
        }
        return res.redirect('/login');
    },
    isAdmin(req, res, next) {
        if(req.user && req.user.isAdmin){
            return next();
        }
        return res.redirect('/logout');
    }
}