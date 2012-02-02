var SWFScheduler = function(elapse) { // [msec]
    this.elapse = elapse;
    this.taskList = [];
    this.timerId = null;
    this.addTask = function(runnable, args) {
        var task = {runnable:runnable, args:args};
        this.taskList.push(task);
    }
    this.delTask = function(runnable) {
        for(var i = 0, n = this.taskList.length ; i < n ; i++) {
            if (this.taskList[i].runnable == runnable) {
                delete this.taskList[i];
            }
        }
    }
    this.start = function() {
        if (this.timerId === null) {
            this.timerId = setTimeout(this.run, this.elapse);
        } else {
            console.warn("SWFScheduler::start() but timeId is already set.");
        }
    }
    this.stop = function() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timeId = null;
        } else {
            console.warn("SWFScheduler::stop() but timeId is null");
        }
    }
    this.run = function() {
        console.log("---run ---");
        this.timerId = setTimeout(this.run, this.elapse);
        for(var i = 0, n = this.taskList.length ; i < n ; i++) {
            var task = taskList[i];
            task.runnable(task.args);
        }
    }
}