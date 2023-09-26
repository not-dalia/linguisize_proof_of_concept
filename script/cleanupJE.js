function cleanupJE() {
    document.querySelectorAll('img').forEach(img => img.parentNode.removeChild(img))
    document.querySelectorAll('body > *').forEach(e => {
        if (!e.innerText || e.innerText.trim().length == 0) e.parentNode.removeChild(e)
    })
    document.querySelectorAll('.fig').forEach(f => f.parentNode.removeChild(f))

    // flatten chapters
    chapters = document.querySelectorAll('.chapter')
    chapters.forEach(c => {
        const fragment = document.createDocumentFragment()
        while(c.firstChild) {
            const child = c.firstChild;
            c.removeChild(child);
            fragment.appendChild(child);
        }
        c.parentNode.replaceChild(fragment, c);
    })
}

function populateBook () {
    let bodyChildren = document.querySelectorAll('body > * ')
    let lastPage = 1
    let wordCountSinceLastPage = 0
    let book = []
    let bookText = []
    bodyChildren.forEach(c => {
        let type = c.tagName.toLowerCase()
        if (c.innerText.replace(/\n/g, "").trim() == '') return
        if (wordCountSinceLastPage > 250) {
            lastPage++
            let lastObj = book[book.length - 1]
            lastObj.pages[lastPage] = []
            lastObj.pageOrder.push(lastPage)
            wordCountSinceLastPage = 0
        }
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
                wordCountSinceLastPage += 10
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
                wordCountSinceLastPage += c.innerText.replace(/\n/g, "").trim().split(' ').length
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
                wordCountSinceLastPage += c.innerText.replace(/\n/g, "").trim().split(' ').length
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
