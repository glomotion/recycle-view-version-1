import { html, css, LitElement } from 'lit-element';

export class App extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 100%;
        height: 100%;
      }

      .list {
        overflow: scroll;
        list-style-type: none;
        padding: 0;
      }

      .tile {
        background-color: grey;
        margin: 10px 0;
        height: 150px;
        width: 100%;
      }
    `;
  }

  static get properties() {
    return {};
  }

  /* LIT ELEMENT COMPONENT LIFE CYCLE EVENTS:
  ----------------------------------------------------------------------- */
  firstUpdated() {

  } 

  private getSlidingWindow = isScrollDown => {
    const increment = this.listSize / 2;
    let firstIndex;
    
    if (isScrollDown) {
      firstIndex = this.currentIndex + increment;
    } else {
      firstIndex = this.currentIndex - increment;
    }
    
    if (firstIndex < 0) {
      firstIndex = 0;
    }
    
    return firstIndex;
  }

  private recycleDOM = firstIndex => {
    for (let i = 0; i < this.listSize; i++) {
      const tile = document.querySelector("#tile-" + i);
      tile.firstElementChild.innerText = collection[i + firstIndex].title;
      tile.lastChild.setAttribute("src", collection[i + firstIndex].imgSrc);
    }
  }

  private getNumFromStyle = numStr => Number(numStr.substring(0, numStr.length - 2));

  private adjustPaddings = isScrollDown => {
    const container = this.shadowRoot.querySelector(".list") as HTMLElement;
    const currentPaddingTop = this.getNumFromStyle(container.style.paddingTop);
    const currentPaddingBottom = this.getNumFromStyle(container.style.paddingBottom);
    const remPaddingsVal = 170 * (listSize / 2);
    if (isScrollDown) {
      container.style.paddingTop = currentPaddingTop + remPaddingsVal + "px";
      container.style.paddingBottom = currentPaddingBottom === 0 ? "0px" : currentPaddingBottom - remPaddingsVal + "px";
    } else {
      container.style.paddingBottom = currentPaddingBottom + remPaddingsVal + "px";
      container.style.paddingTop = currentPaddingTop === 0 ? "0px" : currentPaddingTop - remPaddingsVal + "px";
      
    }
  }

  private topSentCallback = entry => {
    if (this.currentIndex === 0) {
      const container = this.shadowRoot.querySelector(".list") as HTMLElement;
      container.style.paddingTop = "0px";
      container.style.paddingBottom = "0px";
    }

    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;

    // conditional check for Scrolling up
    if (
      currentY > this.topSentinelPreviousY &&
      isIntersecting &&
      this.currentRatio >= this.topSentinelPreviousRatio &&
      currentIndex !== 0
    ) {
      const firstIndex = getSlidingWindow(false);
      this.adjustPaddings(false);
      this.recycleDOM(firstIndex);
      currentIndex = firstIndex;
    }

    this.topSentinelPreviousY = currentY;
    this.topSentinelPreviousRatio = currentRatio;
  }

  private bottomSentCallback = entry => {
    if (this.currentIndex === this.collectionSize - this.listSize) {
      return;
    }
    const currentY = entry.boundingClientRect.top;
    const currentRatio = entry.intersectionRatio;
    const isIntersecting = entry.isIntersecting;

    // conditional check for Scrolling down
    if (
      currentY < this.bottomSentinelPreviousY &&
      currentRatio > this.bottomSentinelPreviousRatio &&
      isIntersecting
    ) {
      const firstIndex = getSlidingWindow(true);
      this.adjustPaddings(true);
      this.recycleDOM(firstIndex);
      this.currentIndex = firstIndex;
    }

    this.bottomSentinelPreviousY = currentY;
    this.bottomSentinelPreviousRatio = currentRatio;
  };

  initIntersectionObserver() {
    const options = {
      /* root: document.querySelector(".cat-list") */
    }

    const callback = entries => {
      entries.forEach(entry => {
        if (entry.target.id === 'tile-0') {
          this.topSentCallback(entry);
        } else if (entry.target.id === `tile-${this.listSize - 1}`) {
          this.bottomSentCallback(entry);
        }
      });
    }

    var observer = new IntersectionObserver(callback, options);
    observer.observe(document.querySelector("#tile-0"));
    observer.observe(document.querySelector(`#tile-${this.listSize - 1}`));
  }

  private init() {
    this.collectionSize = 200;
    this.listSize = 15;
    this.collection = this.initCollection(this.collectionSize);
    this.initList(listSize);
    this.initIntersectionObserver();
  }

  render() {
    return html`
      <div id="container">
        <ul class="list" stle="top-padding: 0px; bottom-padding: 0px">
        </ul>
      </div>
    `;
  }
}

customElements.define('gu-app', App);
