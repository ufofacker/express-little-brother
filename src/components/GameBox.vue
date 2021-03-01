<template>
  <div class="game-box">
    <div v-if="!isLoadGameView" class="user-wait">
      <h1 class="title">快递小哥</h1>
      <img class="btn-play animate-btn-play" src="../assets/img/btn_start_1.png" @click="startGame" />
      <!-- <div class="coin-wrapper">
        <img class="animate-coin" src="../assets/img/coin.png" />
      </div>-->
    </div>
    <div v-else class="game-container">
      <div class="left-container">
        <img class="top" src="../assets/img/bg_top.png" />
        <div class="bottom">
          <div class="left-border"></div>
          <canvas id="stage" width="400" height="400"></canvas>
          <div class="right-border"></div>
        </div>
      </div>
      <div class="right-container">
        <h1>获取金币</h1>
        <div class="coin-total"></div>
        <h1>操作说明</h1>
        <img class="img__operate-desc" src="../assets/img/arrow_tip.png" alt />
        <h2>左箭头控制角色向左，右箭头控制人物向右移动</h2>
      </div>
    </div>
  </div>
</template>

<script>
import { getRandomNumber } from "./utils";
const keyCodeMapping = {
  LEFT: 37,
  RIGHT: 39
};
export default {
  name: "GameBox",
  props: {
    msg: String
  },
  data() {
    return {
      bgImg: {
        //游戏主区域背景图
        previous: {
          x: -5,
          y: -400
        },
        next: {
          x: -5,
          y: 0
        }
      },
      isLoadGameView: false,
      mainActor: {
        //主角
        speed: 256
      },
      groupActorList: [], //群演
      imgAsyncLoadList: [], //加载中图片列表
      requestAnimationFrame: null,
      currentTime: null, //当前时间
      currentKeyCode: null, //当前键盘点击的按键code
      monstersCaught: 0, //得分
      img: {
        background: null,
        mainActor: null
      }
    };
  },
  mounted() {
    this.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      window.mozRequestAnimationFrame;
    //监听键盘按键点击
    addEventListener(
      "keydown",
      e => {
        this.currentKeyCode = e.keyCode;
      },
      false
    );
    //监听键盘按键释放
    addEventListener(
      "keyup",
      e => {
        this.currentKeyCode = null;
      },
      false
    );
  },
  methods: {
    startGame() {
      this.isLoadGameView = true;
      this.currentTime = Date.now();
      this.initGroupActors();
      this.$nextTick(() => {
        this.initGameEnv();
        this.resetActors();
        this.sceneLoop();
      });
    },
    initGameEnv() {
      this.canvas = document.getElementById("stage");
      this.imgAsyncLoadList = [
        this.loadStageBgImg(),
        this.loadMainActor(),
        ...this.loadGroupActors()
      ];
    },
    /**
     * @description 初始化配角对象
     */
    initGroupActors() {
      for (let i = 1; i <= 9; i++) {
        this.groupActorList.push({
          name: `obstacle_${i}`,
          x: 0,
          y: 0,
          onStage: false,
          actorImg: null
        });
      }
    },
    /**
     * @description 加载舞台背景图片
     */
    loadStageBgImg() {
      return new Promise((resolve, reject) => {
        this.img.background = new Image();
        this.img.background.onload = function() {
          resolve("success");
        };
        this.img.background.src = require("@/assets/img/bg_road_1.png");
      });
    },
    /**
     * @description 加载主演图片
     */
    loadMainActor() {
      return new Promise((resolve, reject) => {
        this.img.mainActor = new Image();
        this.img.mainActor.onload = function() {
          resolve("success");
        };
        this.img.mainActor.src = require("@/assets/img/main_actor.png");
      });
    },
    /**
     * @description 加载群演图片
     */
    loadGroupActors() {
      let _promiseList = [];
      this.groupActorList.forEach((item, key) => {
        _promiseList.push(
          new Promise((resolve, reject) => {
            let _img = new Image();
            _img.onload = function() {
              resolve("success");
            };
            _img.src = require(`@/assets/img/${item.name}.png`);
            item.actorImg = _img;
          })
        );
      });
      return _promiseList;
    },
    /**
     * @description 画布上绘制背景图片
     */
    drawBgImg(ctx) {
      ctx.drawImage(
        this.img.background,
        0,
        0,
        640,
        1138,
        this.bgImg.previous.x,
        this.bgImg.previous.y++,
        410,
        400
      );
      ctx.drawImage(
        this.img.background,
        0,
        0,
        640,
        1138,
        this.bgImg.next.x,
        this.bgImg.next.y++,
        410,
        400
      );
    },
    /**
     * @description 画布上绘制主角图片
     */
    drawMainActorImg(ctx) {
      ctx.drawImage(this.img.mainActor, this.mainActor.x, this.mainActor.y);
    },
    /**
     * @description 画布上绘制配角图片
     */
    drawGroupActorsImg(ctx) {
      this.groupActorList.forEach((item, key) => {
        if (item.onStage) {
          ctx.drawImage(item.actorImg, item.x, item.y);
        }
      });
    },
    /**
     * @description 渲染游戏场景
     */
    renderScene() {
      let _ctx = this.canvas.getContext("2d");
      Promise.all(this.imgAsyncLoadList)
        .then(res => {
          _ctx.clearRect(-5, 0, 410, 400);
          if (this.bgImg.next.y <= 400) {
          } else {
            this.bgImg.previous.y = -400;
            this.bgImg.next.y = 0;
          }
          this.drawBgImg(_ctx);
          this.drawMainActorImg(_ctx);
          this.drawGroupActorsImg(_ctx);
        })
        .catch(err => {});
    },
    /**
     * @description 场景循环
     */
    sceneLoop() {
      let _currentTime = Date.now();
      let _loopTime = _currentTime - this.currentTime;
      this.updateActorStatus(_loopTime / 1000);
      this.renderScene();
      this.currentTime = _currentTime;
      requestAnimationFrame(this.sceneLoop);
    },
    /**
     * @description 更新演员状态
     */
    updateActorStatus(time) {
      switch (this.currentKeyCode) {
        case keyCodeMapping.LEFT:
          {
            this.mainActor.x -= this.mainActor.speed * time;
          }
          break;

        case keyCodeMapping.RIGHT:
          {
            this.mainActor.x += this.mainActor.speed * time;
          }
          break;
      }
      // if (
      //   this.mainActor.x <= this.groupActorList.x + 32 &&
      //   this.groupActorList.x <= this.mainActor.x + 32 &&
      //   this.mainActor.y <= this.groupActorList.y + 32 &&
      //   this.groupActorList.y <= this.mainActor.y + 32
      // ) {
      //   ++this.monstersCaught;
      // }
    },
    /**
     * @description 生成群演
     */
    genGroupActors() {},
    /**
     * @description 重置演员状态
     */
    resetActors() {
      this.mainActor.x = this.canvas.width / 2;
      this.mainActor.y = this.canvas.height - 100;
      [getRandomNumber(10), getRandomNumber(10), getRandomNumber(10)].forEach(
        (item, key) => {
          this.groupActorList[item - 1].onStage = true;
          this.groupActorList[item - 1].x = parseInt(
            Math.random() * this.canvas.width
          );
          this.groupActorList[item - 1].y = this.bgImg.next.y + 20;
        }
      );

      //  this.groupActorList.x = 32 + Math.random() * (this.canvas.width - 64);
      //  this.groupActorList.y = 32 + Math.random() * (this.canvas.height - 64);
    }
  }
};
</script>
<style scoped  lang="scss">
.game-box {
  color: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.user-wait {
  width: 600px;
  height: 300px;
  background: url("../assets/img/bg_ready_wait.jpg");
  background-size: 100%;
  background-repeat: no-repeat;
  background-origin: content-box;
  background-position: 0px 0px;
  .title {
    font-size: 30px;
    padding: 15px;
  }
  .btn-play {
    width: 160px;
    margin-top: 30px;
    &:hover {
      cursor: pointer;
    }
  }
}
.game-container {
  display: flex;
  .left-container {
    display: flex;
    flex-flow: column nowrap;
    background: #a1937c;
    width: 500px;
    .top {
      width: 100%;
      height: 200px;
      margin-bottom: 4px;
    }
    .bottom {
      display: flex;
      .left-border {
        flex: 1;
        width: 20px;
        background: url("../assets/img/tree_1.png");
        background-size: 100%;
      }
      .right-border {
        flex: 1;
        width: 20px;
        background: url("../assets/img/tree_2.png");
        background-size: 100%;
      }
    }
  }
  .right-container {
    width: 160px;
    padding: 10px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    background: #424242;
    .coin-total {
      width: 140px;
      height: 50px;
      background: url("../assets/img/coin_total.png");
      background-size: 140px 40px;
      background-repeat: no-repeat;
      background-origin: content-box;
      background-position: 0px 0px;
    }
    .img__operate-desc {
      width: 100%;
    }
  }
}
// 开始游戏按钮动画
@keyframes keyframes-btn-play {
  from {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }

  50% {
    -webkit-transform: scale3d(1.2, 1.2, 1.2);
    transform: scale3d(1.2, 1.2, 1.2);
  }

  to {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}
.animate-btn-play {
  margin-top: 30px;
  animation: keyframes-btn-play 1s infinite;
}
// 获取金币动画
@keyframes keyframes-coin {
  0% {
    transform: translateX(0);
  }
  5% {
    transform: translateX(-35px);
  }
  10% {
    transform: translateX(-70px);
  }
  15% {
    transform: translateX(-70px);
  }
  20% {
    transform: translateX(-105px);
  }
  25% {
    transform: translateX(-140px);
  }
  30% {
    transform: translateX(-175px);
  }
  35% {
    transform: translateX(-210px);
  }
  40% {
    transform: translateX(-245px);
  }
  45% {
    transform: translateX(-280px);
  }
  50% {
    transform: translateX(-315px);
  }
  55% {
    transform: translateX(-350px);
  }
  60% {
    transform: translateX(-385px);
  }
  65% {
    transform: translateX(-420px);
  }
  70% {
    transform: translateX(-455px);
  }
  75% {
    transform: translateX(-490px);
  }
  80% {
    transform: translateX(-525px);
  }
  85% {
    transform: translateX(-560px);
  }
  90% {
    transform: translateX(-595px);
  }
  95% {
    transform: translateX(-630px);
  }
  100% {
    transform: translateX(-665px);
  }
}
.coin-wrapper {
  width: 35px;
  height: 35px;
  overflow: hidden;
  .animate-coin {
    height: 35px;
    animation: keyframes-coin steps(1, start) 0.5s infinite;
  }
}
</style>
