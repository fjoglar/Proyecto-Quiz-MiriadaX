var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
    models.Quiz.find(quizId).then(
        function(quiz) {
            if (quiz) {
                req.quiz = quiz;
                next();
            } else {
                next(new Error('No existe quizId = ' + quizId));
            }
    }).catch(function(error) { next(error)});
};

// GET /quizes y /quizes?search=
exports.index = function(req, res) {
    if (req.query.search) {
        var search = '%' + req.query.search.split(' ').join('%') + '%';
        models.Quiz.findAll({where: ["pregunta like ?", search], order: 'pregunta ASC'}).then(
            function(quizes) {
                res.render('quizes/index', { quizes: quizes, errors: []});
            }
        ).catch(function(error) { next(error); });
    } else {
        models.Quiz.findAll().then(
            function(quizes) {
                res.render('quizes/index', { quizes: quizes, errors: []});
            }
        ).catch(function(error) { next(error)});
    }
};

// GET /quizes/:id
exports.show = function(req, res) {
    models.Quiz.find(req.params.quizId).then(
        function(quiz) {
            res.render('quizes/show', { quiz: req.quiz, errors: []});
        })
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if (req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase()) {
        resultado = 'Correcto';
    }
    res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res) {
    // Crea otro objeto quiz.
    var quiz = models.Quiz.build(
        {pregunta: "Pregunta", respuesta: "Respuesta"}
    );
    res.render('quizes/new', { quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
    var quiz = models.Quiz.build(req.body.quiz);

    quiz.validate()
        .then(function(err) {
                if (err) {
                    res.render('quizes/new', {quiz: quiz, errors: err.errors});
                } else {
                    // guarda en DB los campos pregunta y respuesta de quiz
                    quiz.save({ fields: ["pregunta", "respuesta"]})
                        .then(function() { res.redirect('/quizes')})
                }
            }
        );
};
