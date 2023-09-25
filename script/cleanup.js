function splitPages () {
    // Select all <p> elements containing the <span> with class "pagenum."
    var paragraphs = document.querySelectorAll("p:has(.pagenum)");

    paragraphs.forEach(function (paragraph) {
        // Find the <span> element with class "pagenum" within the <p>.
        var pagenumSpan = paragraph.querySelector(".pagenum");

        // Create a new <p> element for the content before the <span>.
        var beforeText = paragraph.textContent.split(pagenumSpan.textContent)[0].trim();
        var afterText = paragraph.textContent.split(pagenumSpan.textContent)[1].trim();

        if (afterText.length == 1) {
          beforeText += afterText
          afterText = ''
        }

        var beforeContent = document.createElement("p");
        beforeContent.textContent = beforeText;

        // Create a new <p> element for the content after the <span>.
        var afterContent = document.createElement("p");
        afterContent.textContent = afterText;

        // Replace the original <p> element with the new <p> elements.
        paragraph.parentNode.insertBefore(beforeContent, paragraph);
        paragraph.parentNode.insertBefore(pagenumSpan, paragraph);
        if (afterText.length > 0) paragraph.parentNode.insertBefore(afterContent, paragraph);
        paragraph.parentNode.removeChild(paragraph);
    });
}


function populateBook () {
    let bodyChildren = document.querySelectorAll('body > * ')
    let lastPage = '{1}'
    let book = []
    let bookText = []
    bodyChildren.forEach(c => {
        let type = c.tagName.toLowerCase()
        if (c.innerText.replace(/\n/g, "").trim() == '') return
        switch (type) {
            case 'h2': {
                let newObj = {
                    chapter: c.innerText.replace(/\n/g, "").trim(),
                    pageStart: lastPage,
                    pages: {
                        [lastPage]: []
                    },
                    pageOrder: [lastPage]
                }
                book.push(newObj)
                break
            }
            case 'span': {
                let lastObj = book[book.length - 1]
                if (c.classList.contains('pagenum')) {
                    lastPage = c.innerText.replace(/\n/g, "").trim()
                    if (!lastObj.pages[lastPage]) {
                        lastObj.pages[lastPage] = []
                        lastObj.pageOrder.push(lastPage)
                    }
                } else {
                    lastObj.pages[lastPage].push(c.outerHTML)
                    bookText.push(c.innerText.replace(/\n/g, "").trim())
                    console.log(`found element of type ${type} in page ${lastPage}`)
                }
                break
            }
            case 'p': {
                let lastObj = book[book.length - 1]
                if (lastObj.pageOrder.length > 1 && lastObj.pages[lastPage].length == 0 && c.innerText.replace(/\n/g, "").trim().length == 1) {
                  lastObj.pages[lastObj.pageOrder[lastObj.pageOrder.length - 2]].push(c.outerHTML)
                } else {
                  lastObj.pages[lastPage].push(c.outerHTML)
                }
                bookText.push(c.innerText.replace(/\n/g, "").trim())
                break
            }
            case 'script': {
                break
            }
            default: {
                let lastObj = book[book.length - 1]
                lastObj.pages[lastPage].push(c.outerHTML)
                bookText.push(c.innerText.replace(/\n/g, "").trim())
                console.log(`found element of type ${type} in page ${lastPage}`)
                break
            }
        }
    })
    return { book, bookText }
}

function getWordFrequency(words) {
    let wordFreqDict = {}
    words.forEach(word => {
        let w = word.toLowerCase()
        if (!wordFreqDict[w]) wordFreqDict[w] = 0
        wordFreqDict[w]++
    })
    return wordFreqDict
}

splitPages()
let book = populateBook()
let text = book.bookText.join(' ')
let words = text.match(/\b\w+(?:'\w+)?\b|\d+/g);
let wordCount = words.length
let wordFrequencyDict = getWordFrequency(words)

let freqDictKeys = Object.keys(frequencyDict)
let reverseDict = {}
freqDictKeys.forEach(k => {
    let val = frequencyDict[k]
    if (!reverseDict[val]) reverseDict[val] = []
    reverseDict[val].push(k)
})
