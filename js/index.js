(function(){
    var width = 9;//宽度 列数
    var height = 9;//高度 行数
    var mine = 10;//地雷数
    var flag = 10;//剩余旗帜数

    var oWrap = document.querySelector('.wrap');
    var oList = document.querySelector('.list');
    var aBtn = document.querySelectorAll('.panel input');
    var arrPosition;
    var aaLi = [];
    var open = 0;//打开结果数
    var isStart = false;//是否开始
    selectLevel(0);

    /*显示等级界面*/
    aBtn[0].onclick = function() {
        var oPop = document.querySelector('.pop');
        oPop.style.display = 'block';
        oPop.innerHTML = '';
        var inner = '<div class="popWrap"> ' +
                        '<div class="topBox">' +
                            '<span class="title">选项</span>' +
                            '<input type="button" value="" class="close"></input>' +
                        '</div>' +
                        '<div class="bottomBox">' +
                            '<div class="area">' +
                                '<span class="title">难度</span>' +
                                '<div class="contBox">' +
                                    '<ul class="levelBox">' +
                                        '<li>' +
                                            '<p>初级</p>' +
                                            '<p><label class="level"><input type="radio" name="level" checked>10个雷</label></p> ' +
                                            '<p>9×9平铺网络</p>' +
                                        '</li>' +
                                        '<li>' +
                                            '<p>中级</p>' +
                                            '<p><label class="level"><input type="radio" name="level">40个雷</label></p>' +
                                            '<p>16×16平铺网络</p>' +
                                        '</li>' +
                                        '<li>' +
                                            '<p>高级</p>' +
                                            '<p><label class="level"><input type="radio" name="level">90个雷</label></p>' +
                                            '<p>16×30平铺网络</p>' +
                                        '</li>' +
                                    '</ul>' +
                                    '<ul class="levelBox levelBoxRight">' +
                                        '<li>' +
                                            '<p><label class="level"><input type="radio" type="level">自定义</label></p>' +
                                            '<ul class="selfBox">' +
                                                '<li>' +
                                                    '<span>高度(9-24)(H):</span>' +
                                                    '<input type="text" value="9">' +
                                                '</li>' +
                                                '<li>' +
                                                    '<span>宽度(9-30)(W):</span>' +
                                                    '<input type="text" value="9">' +
                                                '</li>' +
                                                '<li>' +
                                                    '<span>雷数(10-668)(M):</span>' +
                                                    '<input type="text" value="10">' +
                                                '</li>' +
                                            '</ul>' +
                                        '</li>' +
                                    '</ul>' +
                                '</div>' +
                            '</div>' +
                            '<div class="btns">' +
                                '<input type="button" value="确定" class="btnBlue ok">' +
                                '<input type="button" value="取消" class="btnGray undo">' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        oPop.innerHTML = inner;
    };

    /*关闭*/
    aBtn[1].onclick = function() {
        window.close();
    };

    /*选择等级*/
    function selectLevel(level) {
        var levelVal =  [[9, 9, 10], [16, 16, 40], [16, 30, 90]];
        height = levelVal[level][0];
        width = levelVal[level][1];
        mine = levelVal[level][2];
        flag = mine;
        init();
    }

    /*自定义*/
    function setLevel() {

    }

    /*初始化数据*/
    function init() {
        arrPosition = getMinePosition();
        getOtherPosition();
        createData();
        setFlag();
    }


    /*生成数据*/
    function createData() {
        var iWidth = 56 * 9 / height;
        var iWrapWidth = iWidth * width;
        css(oWrap, 'width', iWrapWidth );
        for (var i = 0; i < height; i++) {
            var arr = new Array(width);
            for (var j = 0; j < width; j++) {
                var li = document.createElement('li');
                css(li, 'width', iWidth );
                css(li, 'height', iWidth );
                li.row = i;
                li.col = j;
                li.isOpen = false;
                li.right = 0;
                li.onmousemove = function() {
                    if (!this.isOpen){
                        var className = ['hover', 'flagHover', 'askHover'];
                        this.className = className[this.right];
                    }

                };
                li.onmouseout = function(){
                    if (!this.isOpen){
                        var className = ['', 'flag', 'ask'];
                        this.className = className[this.right];
                    }
                };
                li.onmousedown = function(ev) {
                    if (ev.button == 2){
                        setTimer();
                        if (flag == 0 && this.right == 0) {
                            return;
                        }
                        this.right = (this.right + 1) % 3;
                        var arrFlag = [0, -1, 1];
                        var className = ['', 'flag', 'ask'];
                        flag += arrFlag[this.right];
                        this.className = className[this.right];
                        setFlag();
                        isSuccess();
                    }
                };
                li.onclick = function(){
                    setTimer();
                    var result = arrPosition[this.row][this.col];
                    if (result == -1) {
                        fail(this.row, this.col);
                    } else if (result == 0) {
                        getAroundResult(this.row, this.col);
                    }else {
                        setResult(this.row, this.col);
                    }
                    isSuccess();
                };
                oList.appendChild(li);
                arr[j] = li;
            }
            aaLi.push(arr);
        }
    }

    /*设置剩余旗帜*/
    function  setFlag() {
        var oFlag = document.querySelector('.mineBox .num');
        oFlag.innerHTML = flag;
    }

    /*设置时间的定时器*/
    function setTimer() {
        if (isStart) {
            return;
        }
        isStart = true;
        var oClock = document.querySelector('.clockBox .num');
        if (oClock.timer) {
            return;
        }
        var num = 1;
        oClock.innerHTML = num++;
        oClock.timer = setInterval(function () {
            oClock.innerHTML = num++;
        }, 1000);
    }

    /*清除时间的定时器*/
    function clearTimer() {
        var oClock = document.querySelector('.clockBox .num');
        clearInterval(oClock.timer);
        oClock.timer = 0;
    }

    /*结果成功*/
    function isSuccess() {
        if (open + mine == width * height) {
            clearTimer();
            alert('成功');
        }
    }

    /*结果失败*/
    function fail(row, col) {
        clearTimer();
        var failLi = [];
        var index = 0;
        var curIndex = 0;
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var cur = aaLi[i][j];
                if (arrPosition[i][j] == -1) {
                    failLi.push(cur);
                    index++;
                    setResult(i, j);
                    if (i == row && col == j) {
                        curIndex = index - 1;
                    }
                } else {
                    clearFn(cur);
                }
                if (cur.className == 'flag') {
                    cur.className = arrPosition[i][j] == -1 ? 'flagTrue': 'flagFalse';
                }
            }
        }
        aaLi[row][col].className = 'fail';
        explode(failLi, curIndex);
    }

    /*地雷爆炸*/
    function explode(failLi, index) {
        failLi[index].className = 'mineExpRed';
        var i = index + 1;
        var timer1 = setInterval(function(){
            failLi[i].className = 'mineExp';
            i++;
            if (i > failLi.length - 1) {
                clearInterval(timer1);
            }
        },50);
        var j = index - 1;
        var timer2 = setInterval(function(){
            failLi[j].className = 'mineExp';
            j--;
            if (j < 0) {
                clearInterval(timer2);
            }
        },50);


    }

    /*空白周围的数字*/
    function getAroundResult(row, col) {
        var result = setResult(row, col);
        if (result == 0) {
            if (row > 0 && col > 0) {
                getAroundResult(row - 1, col - 1);
            }
            if (row > 0) {
                getAroundResult(row - 1, col);
            }
            if (row > 0 && col < width - 1) {
                getAroundResult(row - 1, col + 1);
            }
            if (col > 0) {
                getAroundResult(row, col - 1);
            }
            if (col < width - 1) {
                getAroundResult(row, col + 1);
            }
            if (row < height - 1 && col > 0) {
                getAroundResult(row + 1, col - 1);
            }
            if (row < height - 1) {
                getAroundResult(row + 1, col);
            }
            if (row < height - 1 && col < width - 1) {
                getAroundResult(row + 1, col + 1);
            }
        }
    }

    /*设置结果*/
    function setResult(row, col, callBack) {
        if (row < 0 || row > height || col < 0 || col > width) {
            return -2;
        }
        var obj = aaLi[row][col];
        if (obj.isOpen || obj.right == 1) {
            return -2;
        }
        var result = arrPosition[row][col];
        var arrClassName = ['minusOne', 'zero', 'one', 'two', 'three','four', 'five', 'six', 'seven', 'eight'];
        obj.className = arrClassName[result + 1];
        clearFn(obj);
        callBack && callBack();
        return result;
    }

    /*清除事件*/
    function clearFn(obj) {
        obj.isOpen = true;
        open++;
        obj.onclick = null;
        obj.onmousedown = null;
    }

    /*随机生成地雷的位置*/
    function getMinePosition() {
        var arrPosition = {};
        var i = 0;
        while (i != mine) {
            var x = parseInt(Math.random() * height);
            var y = parseInt(Math.random() * width);
            if (typeof arrPosition[x] != 'object') {
                arrPosition[x] = {};
                arrPosition[x][y] = -1;
                i++;
            } else if (typeof arrPosition[x][y] != 'number' ) {
                arrPosition[x][y] = -1;
                i++;
            }
        }
        return arrPosition;
    }

    /*生成其他位置的数字*/
    function getOtherPosition() {
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                if (getMineNum(i, j) == 1) {
                    continue;
                } else {
                     if (typeof arrPosition[i] != 'object') {
                         arrPosition[i] = {};
                     }
                     arrPosition[i][j] = getNum(i, j);
                }
            }
        }
    }

    /*获取数字*/
    function getNum(row, col) {
        return  getMineNum(row - 1, col - 1) + getMineNum(row - 1, col) + getMineNum(row - 1, col + 1)
            + getMineNum(row, col - 1)  + getMineNum(row, col + 1)
            + getMineNum(row + 1, col - 1) + getMineNum(row + 1, col) + getMineNum(row + 1, col +  1);
    }

    /*判断当前是否是雷*/
    function getMineNum(row, col) {
        if (row < 0 || row > height || col < 0 || col > width) {
            return 0;
        }
        if (typeof arrPosition[row] == 'object' && typeof arrPosition[row][col] == 'number'  && arrPosition[row][col]== -1) {
            return 1;
        }
        return 0;
    }

})();