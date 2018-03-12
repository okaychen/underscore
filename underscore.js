//  okaychen (9月21号)
//  underscore源码分析与学习
//  希望可以通过这种方式学习underscore的代码思路
//  选取的版本 underscore 1.8.3


//整个函数在一个闭包中，避免全局变量污染。通过传入this，来改变函数的作用域
(function () {
    //创建一个root对象，在浏览器中就是window，在服务器(如node)中就是'exports'
    var root = this;

    //保存 '_' 被覆盖之前的值
    var previousUnderscore = root._;

    //将内置对象的原型链缓存在局部变量，获取函数原型属性prototype，以便压缩
    var
        ArrayProto = Array.prototype,
        ObjectProto = Object.prototype,
        FuncProto = Function.prototype;

    //将内置对象原型中常用的方法缓存在局部变量中
    var
        navtiveIsArray = Array.isArray,
        navtiveKeys = Object.keys, //Object.keys() 方法会返回一个由一个给定对象的自身可枚举属性组成的数组，数组中属性名的排列顺序和使用 for...in 循环遍历该对象时返回的顺序一致 
        navtiveBind = FuncProto.bind, //函数柯里化
        navtiveCreate = Object.create;

    //裸函数
    var Ctor = function () {};

    //为下划线对象创建一个安全索引,（下划线在此定义）
    var _ = function (obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    }

    //针对不同的宿主对象，将underscore存放在不同的对象中
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _; //Node.js环境中/好熟悉的赶脚啊，哈哈
        }
        exports._ = _;
    } else {
        root._ = _; //浏览器的宿主环境中将underscore挂载在window对象中
    }

    //现在的版本号
    _.VERSION = '1.8.3';

    //核心函数1，对于参数小于等于4的情况分类处理：
    var optimizeCb = function (func, context, argCount) {
        if (context === void 0) return func;
        switch (argCount == null ? 3 : argCount) {
            case 1:
                return function (value) {
                    return func.call(context, value);
                };
            case 2:
                return function (value, other) {
                    return func.call(context, value, other);
                };
            case 3:
                return function (value, index, collection) {
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function (accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
        }
        return function () {
            return func.apply(context, arguments);
        }
    }

    /* 
     * 
     * 对参数进行判断，如果是函数则返回上面所说的回调函数；
     * 如果是对象则返回一个能判断对象是否相等的函数；
     * 默认返回一个获取对象属性的函数
     * 
     */
    var cb = function (value, context, argCount) {
        if (value == null) return _.identity;
        if (_.inFunction(value)) return optimizeCb(value, context, argCount);
        if (_.isObject(value)) return _.matcher(value);
        return _.prototype(value);
    }
    _.iteratee = function (value, context) {
        return cb(value, context, Infinity);
    }

    // 创建一个内部函数分配
    var createAssigner = function (keysFunc, undefinedOnly) {
        return function (obj) {
            var length = arguments.length;
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length;
                for (var i = 0; i < l; i++) {
                    var key = key[i];
                    if (!undefined || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
        }
    }

    //用于创建从另一个对象继承新对象的内部函数
    var baseCreate = function (prototype) {
        if (!_.isObject(prototype)) return {};
        if (navtiveCreate) return navtiveCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor();
        Ctor.prototype = null;
        return result;
    };
    var property = function (key) {
        return function (obj) {
            return obj == null ? void 0 : obj[key];
        }
    }

    // 为收集方法做准备，应作为数组或对象的迭代
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var getLength = property('length');
    var isArrayLink = function (collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    }

    // _.each方法
    _.each = _.forEach = function (obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLink(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj)
            }
        }
        return obj;
    }

}.call(this));

// 去抖函数，传入的函数在wait时间之后（或者之前）执行，并且只会被执行一次。
// 如果immediate传递为true，那么在函数被传递时就立即调用
// 实现原理：涉及异步JavaScript，多次调用_.debounce返回的函数，会一次执行完，但是每次调用
// 该函数又会清空上一次的TimeoutID，所以实际上只执行了最后一个setTimeout的内容
_.debounce = function (func, wait, immediate) {
    var timeout, result;

    var later = function (context, args) {
        timeout = null;
        if (args) result = func.apply(context, args);
    };

    // 被返回的函数，该函数只会调用一次。
    var debounced = restArgs(function (args) {
        // 这行代码的作用是清除上一次的TimeoutID,
        // 使得如果有多次调用该场景的函数时，只执行最后一次调用的延时
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            // 如果传递了immediate并且timeout为空，那么就立即调用func，否则不立即调用。
            var callNow = !timeout;
            //下面这行代码，later函数内部的func函数注定不会被执行，因为没有给later传递参数。
            //它的作用是确保返回了一个timeout,并且保持到wait毫秒之后，才执行later，
            //清空timeout。而清空timeout是在immediate为true时，callNow为true的条件。
            //timeout = setTimeout(later, wait)的存在是既保证上升沿触发，
            //又保证wait内最多触发一次的必要条件。
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(this, args);
        } else {
            // 如果没有传递immediate，那就使用_.delay函数延时执行later。
            timeout = _.delay(later, wait, this, args);
        }
        return result;
    });

    // 该函数用于取消当前去抖函数
    debounced.cancel = function () {
        clearTimeout(timeout);
        timeout = null;
    };
    return debounced;
}