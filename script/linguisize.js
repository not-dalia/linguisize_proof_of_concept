class PageLoader {
  constructor(frequencyDict, storyOutline, storyName, pageContainerId) {
    this.frequencyDict = frequencyDict;
    this.storyOutline = storyOutline;
    this.storyName = storyName;
    this.pageContainerId = pageContainerId;
    this.frequencyBoundaries = this._findMinMaxFrequency();
    this.minFontSize = 0.5;
    this.maxFontSize = 5;
    this.exponent = 5; // Adjust this to control the exponential scaling
    this.splitPoint = 0.5; // Adjust this to control where the exponential scaling starts
    this.lastLoadedPage = 233;

    const pageNumbers = new Set();
    for (let i = 0; i < storyOutline.length; i++) {
      const pages = storyOutline[i].pageOrder.map(p => (p + ''));
      for (let j = 0; j < pages.length; j++) {
        pageNumbers.add(pages[j]);
      }
    }
    this.pageNumbers = [...pageNumbers];

    const pageNumberTotalElement = document.getElementById('page-number-total');
    if (pageNumberTotalElement) {
      pageNumberTotalElement.innerText = this.pageNumbers.length;
    }
  }

  setMinFontSize(minFontSize) {
    this.minFontSize = Math.min(minFontSize, this.maxFontSize)
    // if (this.lastLoadedPage != 0) this.loadPage(this.lastLoadedPage);
  }

  setMaxFontSize(maxFontSize) {
    this.maxFontSize = Math.max(maxFontSize, this.minFontSize)
    // if (this.lastLoadedPage != 0) this.loadPage(this.lastLoadedPage);
  }

  setExponent(exponent) {
    this.exponent = exponent/100;
    // if (this.lastLoadedPage != 0) this.loadPage(this.lastLoadedPage);
  }

  setSplitPoint(splitPoint) {
    this.splitPoint = Math.max(splitPoint / 100, this._getNormalisedFrequency(this.frequencyBoundaries.minFrequency));
    this.frequencyBoundaries = this._findMinMaxFrequency();
    // if (this.lastLoadedPage != 0) this.loadPage(this.lastLoadedPage);
  }

  nextPage() {
    if (this.lastLoadedPage != 0) {
      let lastLoadedPageIndex = this.pageNumbers.indexOf(this.lastLoadedPage);
      if (lastLoadedPageIndex < this.pageNumbers.length - 1) {
        this.loadSomePages(this.pageNumbers[lastLoadedPageIndex + 1], 1);
      }
    }
  }

  prevPage() {
    if (this.lastLoadedPage != 0) {
      let lastLoadedPageIndex = this.pageNumbers.indexOf(this.lastLoadedPage);
      if (lastLoadedPageIndex > 0) {
        this.loadSomePages(this.pageNumbers[lastLoadedPageIndex - 1], 1);
      }
    }
  }

  _findMinMaxFrequency() {
    let minFrequency = Number.MAX_SAFE_INTEGER;
    let maxFrequency = Number.MIN_SAFE_INTEGER;
    Object.keys(this.frequencyDict).forEach(word => {
      const frequency = this.frequencyDict[word];
      if (frequency < minFrequency) {
        minFrequency = frequency;
      }
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
      }
    });
    minFrequency = Math.max(1, minFrequency);

    let peakFrequency = maxFrequency * this.splitPoint;

    return { minFrequency, maxFrequency, peakFrequency };
  }

  loadAllPages() {
    const pageContainer = document.getElementById(this.pageContainerId);
    pageContainer.innerHTML = '';
    pageContainer.appendChild(this._createBookHeading());

    const pageNumbers = new Set();
    for (let i = 0; i < storyOutline.length; i++) {
      const pages = storyOutline[i].pageOrder.map(p => (p + ''));
      for (let j = 0; j < pages.length; j++) {
        pageNumbers.add(pages[j]);
      }
    }

    pageNumbers.forEach(pageNumber => {
      this.loadPage(pageNumber);
    })
  }

  loadSomePages(pageNumber, count = 10) {
    const pageContainer = document.getElementById(this.pageContainerId);
    pageContainer.innerHTML = '';
    pageContainer.appendChild(this._createBookHeading());

    const pageNumbers = new Set();
    for (let i = 0; i < storyOutline.length; i++) {
      const pages = storyOutline[i].pageOrder.map(p => (p + ''));
      for (let j = 0; j < pages.length; j++) {
        pageNumbers.add(pages[j]);
      }
    }

    let pageNumbersArray = [...pageNumbers];
    const pageNumberIndex = pageNumbersArray.indexOf(pageNumber);
    const pageNumbersToLoad = pageNumbersArray.slice(pageNumberIndex, pageNumberIndex + count);
    pageNumbersToLoad.forEach(pageNumber => {
      this.loadPage(pageNumber);
    })
  }

  loadPage(pageNumber) {
    this.lastLoadedPage = pageNumber;
    const pageNumberSelectElement = document.getElementById('page-number-select');
    if (pageNumberSelectElement) {
      pageNumberSelectElement.value = pageNumber;
    }

    const pageChapterIndices = this._findPageChapterIndices(pageNumber);
    if (pageChapterIndices.length === 0) {
      throw new Error(`Page ${pageNumber} not found in story ${this.storyName}`);
    }

    let pageElement = document.createElement('div');
    pageElement.classList.add('page');

    let pageNumberElement = document.createElement('div');
    pageNumberElement.classList.add('page-number');
    pageNumberElement.innerText = pageNumber;
    pageElement.appendChild(pageNumberElement);

    pageChapterIndices.forEach(chapterIndex => {
      const chapter = this.storyOutline[chapterIndex];
      if (chapter.pageStart == pageNumber) {
        pageElement.appendChild(this._createChapterHeading(chapterIndex));
      }
      const pageContent = chapter.pages[pageNumber];
      pageContent.forEach(paragraphOuterHtml => {
        pageElement.appendChild(this._createParagraph(paragraphOuterHtml));
      });
    });
    document.getElementById(this.pageContainerId).appendChild(pageElement);
  }

  _createBookHeading() {
    const bookHeading = document.createElement('h1');
    bookHeading.innerText = this.storyName;
    bookHeading.classList.add('book-heading');
    return bookHeading;
  }

  _createChapterHeading(chapterIndex) {
    const chapter = this.storyOutline[chapterIndex];
    const chapterHeading = document.createElement('h2');
    chapterHeading.innerText = chapter.chapter;
    chapterHeading.classList.add('chapter-heading');
    chapterHeading.id = `chapter-${chapterIndex}`;
    return chapterHeading;
  }

  _createParagraph(paragraphOuterHtml) {
    const tempParent = document.createElement('div');
    tempParent.innerHTML = paragraphOuterHtml;
    const tempParagraph = tempParent.firstChild;
    const paragraphText = tempParagraph.innerText;
    // const paragraphWords = paragraphText.match(/\b\w+(?:'\w+)?\b|\d+/g);

    const paragraph = document.createElement('p');
    paragraph.classList.add('paragraph');
    paragraph.classList.add(`tagname-${tempParagraph.tagName.toLowerCase()}`);

    let wordPositions = [...paragraphText.matchAll(/\b\w+(?:'\w+)?\b/g)];
    paragraph.dataset.wordCount = wordPositions.length;

    let tempParagraphText = paragraphText;
    let indexShift = 0;

    wordPositions.forEach((match) => {
      // console.log("Word:", match[0]);
      // console.log("Start Position:", match.index);
      // console.log("End Position:", match.index + match[0].length);
      let wordLength = match[0].length;
      let word = match[0];
      let wordLowerCase = word.toLowerCase();
      let wordSpan = document.createElement('span');
      wordSpan.innerText = word;
      wordSpan.setAttribute('title', `Frequency: ${this.frequencyDict[wordLowerCase]}`);
      wordSpan.dataset.frequency = this.frequencyDict[wordLowerCase];
      if (!this.frequencyDict[wordLowerCase]) {
        console.log(`Word ${wordLowerCase} not found in frequency dictionary`);
      }
      wordSpan.style.fontSize = `${this._getFontSizeFromFrequency(this.frequencyDict[wordLowerCase])}em`;
      // wordSpan.style.color = `hsl(${220 + this.splitPoint * 120}deg, ${this._getScaledFrequency(this.frequencyDict[wordLowerCase]) * 100}%, ${40 + 10 * this._getScaledFrequency(this.frequencyDict[wordLowerCase])}%)`;
      wordSpan.style.color = `hsl(0, 0%, ${40 - this._getScaledFrequency(this.frequencyDict[wordLowerCase]) * 40}%)`;
      // wordSpan.style.marginLeft = `${Math.max(0.5, this._getFontSizeFromFrequency(this.frequencyDict[wordLowerCase]) / 20)}em`;
      let tempSpanContainer = document.createElement('div');
      tempSpanContainer.appendChild(wordSpan);
      let spanHtml = tempSpanContainer.innerHTML;
      let spanLength = spanHtml.length;
      tempParagraphText = tempParagraphText.slice(0, match.index + indexShift) + spanHtml + tempParagraphText.slice(match.index + wordLength + indexShift);
      indexShift += spanLength - wordLength;
    });

    paragraph.innerHTML = tempParagraphText;

    // if (paragraphWords && paragraphWords.length > 0) {
    //   paragraph.dataset.wordCount = paragraphWords.length;
    //   paragraphWords.forEach(word => {
    //     const wordSpan = document.createElement('span');
    //     wordSpan.innerText = word;
    //     wordSpan.dataset.frequency = this.frequencyDict[word];
    //     paragraph.appendChild(wordSpan);
    //   })
    // } else {
    //   const wordSpan = document.createElement('span');
    //   wordSpan.innerText = paragraphText;
    //   paragraph.appendChild(wordSpan);
    // }
    return paragraph;
  }

  _findPageChapterIndices(pageNumber) {
    let pageChapterIndices = [];
    let chapterFound = false;
    for (let i = 0; i < this.storyOutline.length; i++) {
      let chapter = this.storyOutline[i];
      if (chapter.pageOrder.map(p => (p + '')).includes(pageNumber)) {
        pageChapterIndices.push(i);
        chapterFound = true;
      } else if (chapterFound) {
        break;
      }
    }
    return pageChapterIndices;
  }

  _getNormalisedFrequency(frequency) {
    //return frequency / this.frequencyBoundaries.maxFrequency;
    let normalisedFrequency = ((frequency - (this.frequencyBoundaries.minFrequency-1)) / (this.frequencyBoundaries.maxFrequency - (this.frequencyBoundaries.minFrequency-1)));
    return normalisedFrequency
  }

  _scaleFrequency(normalisedFrequency) {
    return normalisedFrequency ** (this.exponent / 10)
  }

  _getSplitFrequency(frequency, min, max, split) {
    if (frequency <= split) {
      return frequency / split;
    } else {
      return min - (frequency - split) / (max - split);
    }
  }

  _getScaledFrequency(frequency) {
    const x = this._getNormalisedFrequency(frequency);
    if (x > this.splitPoint || x == 0) {
      return -1 * ((2 * x - 2 * this.splitPoint)/(2 - 2 * this.splitPoint)) ** this.exponent + 1
    } else {
      return -1 * ((2 * this.splitPoint - 2 * x)/(2 * this.splitPoint)) ** this.exponent + 1
    }
  }

  _getNormalisedFactor(frequency) {
    const factor = this._getScaledFrequency(frequency);
    const maxFactor = this._getScaledFrequency(this.frequencyBoundaries.maxFrequency * this.splitPoint);
    const minFactor = this._getScaledFrequency(this.frequencyBoundaries.minFrequency);
    const normalisedFactor = (factor - minFactor) / (maxFactor - minFactor);
    return normalisedFactor;
  }

  getTestFrequencyFactorSamples({ testFrequencies, testSplitPoint} = {}) {
    let tempSplitPoint = this.splitPoint;
    this.splitPoint = testSplitPoint || this.splitPoint;
    let frequencySamples = [];
    console.log(`Test case for split point ${this.splitPoint}`)
    console.log(`Frequency - Normalised Frequency - Scaled Frequency - Normalised Factor`)
    for (let i = 0; i <= 10; i++) {
      let frequency = this.frequencyBoundaries.minFrequency + (this.frequencyBoundaries.maxFrequency - this.frequencyBoundaries.minFrequency) * i / 10;
      frequencySamples.push(frequency);
    }
    frequencySamples = frequencySamples.concat(testFrequencies || []);
    frequencySamples.sort((a, b) => a - b);
    frequencySamples.forEach(frequency => {
      const normalisedFrequency = this._getNormalisedFrequency(frequency);
      const scaledFrequency = this._getScaledFrequency(frequency);
      const normalisedFactor = this._getNormalisedFactor(frequency);
      console.log(`${frequency} - ${normalisedFrequency} - ${scaledFrequency} - ${normalisedFactor}`);
    })
    this.splitPoint = tempSplitPoint;
    // return frequencySamples;
  }

  _getFontSizeFromFrequency(frequency) {
    const normalisedFactor = this._getScaledFrequency(frequency);
    const fontSize = this.minFontSize + (this.maxFontSize - this.minFontSize) * normalisedFactor;
    return fontSize;
  }
}
