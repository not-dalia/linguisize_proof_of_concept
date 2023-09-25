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
    this.lastLoadedPage = 0;
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
    this.exponent = exponent;
    // if (this.lastLoadedPage != 0) this.loadPage(this.lastLoadedPage);
  }

  setSplitPoint(splitPoint) {
    this.splitPoint = splitPoint;
    this.frequencyBoundaries = this._findMinMaxFrequency();
    // if (this.lastLoadedPage != 0) this.loadPage(this.lastLoadedPage);
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
      const pages = storyOutline[i].pageOrder;
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
      const pages = storyOutline[i].pageOrder;
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
      wordSpan.setAttribute('title', `${this._getNormalisedFrequency(this.frequencyDict[wordLowerCase])} - ${this.frequencyDict[wordLowerCase]}`);
      wordSpan.dataset.frequency = this.frequencyDict[wordLowerCase];
      wordSpan.style.fontSize = `${this._getFontSizeFromFrequency(this.frequencyDict[wordLowerCase])}em`;
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
      if (chapter.pageOrder.includes(pageNumber)) {
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

  _getFontSizeFromFrequency(frequency) {
    // the smaller the frequency, the larger the font size
    // font size should be between 1em and 3em
    let normalisedFrequency = this._getNormalisedFrequency(frequency);
    if (this.exponent > 0) normalisedFrequency = 1 - normalisedFrequency;

    normalisedFrequency = this._getSplitFrequency(normalisedFrequency, this._getNormalisedFrequency(this.frequencyBoundaries.minFrequency), 1, this.splitPoint);

    const maxFactor = this._scaleFrequency(this._getNormalisedFrequency(this.frequencyBoundaries.minFrequency));
    var factor = this._scaleFrequency(normalisedFrequency) / maxFactor;

    const fontSize = this.minFontSize + (this.maxFontSize - this.minFontSize) * factor;
    return fontSize;
  }
}
