var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/todolist', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB!'))
        .catch((err) => console.log(err));

/* Database initialization */
var taskSchema = new mongoose.Schema({
  name: String,
  endDate: String,
  description: String,
  priority: Boolean,
  days_left: Number,
}, { collection: 'task' });
var taskModel = mongoose.model('task', taskSchema);
/* End of database initialization */

/* Helper functions */

/* Returns the days left of each task in order */
function to_days(endDate) {
    days_left = parseInt(((new Date(endDate)) - (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))) / (1000 * 60 * 60 * 24), 10);
  return days_left;
}

/* Sorts the tasks by due date */
function sort(tasks) {
  tasks.sort((x, y) => (x.days_left > y.days_left) ? 1 : -1);
  tasks.sort((x, y) => (x.priority < y.priority) ? 1 : -1);
  return tasks;
}
/* End of helper functions */

/* Get all the tasks. */
router.get('/', (req, res, next) => {
  taskModel.find()
           .then(tasks => {
             res.render('tasks', { tasks: sort(tasks) });
           });
});

/* Directs to the page with a form for new task */
router.get('/add', (req, res, next) => {
  res.render('newtask', {});
});

/* Accepts the form and adds a new task to the database */
router.post('/add', (req, res, next) => {
  var newTask = {
    name: req.body.name,
    endDate: req.body.endDate,
    description: req.body.description,
    priority: false,
    days_left: to_days(req.body.endDate)
  };

  new taskModel(newTask).save();
  res.redirect('/tasks');
});

/* Delete task(s) from the database */
router.post('/', (req, res, next) => {
  if(typeof req.body.ids == 'object') {
    for(id of req.body.ids) {
      taskModel.findByIdAndDelete(id).exec();
    }
  }
  else {
    taskModel.findByIdAndDelete(req.body.ids).exec();
  }
  res.redirect('/tasks');
});

/* Get single task */
router.get('/:id', (req, res, next) => {
  taskModel.findById(req.params.id)
           .then(task => {
             res.render('task', {task: task});
           })
           .catch(err => {
            res.render('taskNotFoundError', {});
           });
});

/* Update Description of a task */
router.post('/:id', (req, res, next) => {
  taskModel.findById(req.params.id)
           .then(task => {
             task.description = req.body.description;
             task.save();
             res.render('task', {task: task});
           })
           .catch(err => {
            res.render('taskNotFoundError', {});
           });
});

/* Toggle Priority of a task */
router.post('/:id/priority', (req, res, next) => {
  taskModel.findById(req.params.id)
           .then(task => {
             task.priority = !task.priority;
             task.save();
             res.render('task', {task: task});
           })
           .catch(err => {
            res.render('taskNotFoundError', {});
           });
});

module.exports = router;
