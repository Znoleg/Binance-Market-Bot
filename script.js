const html = `
<div id="draggable-container">
    <div id="draggable-header">This is a header</div>

    <table>
        <tr>
            <th class="mainheader" id="mainheader-0">
                <!--<span class="table-span">Name of goods: </span>-->
                <input type="text" id="name" placeholder="Mystery box">

                <p></p>

                <!--<span class="table-span">Max scan price: </span>-->
                <input type="number" id="max-scan-price" min="0" placeholder="Max scan price">

                <p></p>

                <!--<span class="table-span">Max auto-buy price:</span>-->
                <input type="number" id="max-buy-price" min="0" placeholder="Auto-buy price">
            </th>
            
            <th>
                <button class="new-coloumn-but">+</button>
            </th>
        </tr>
        <tr id="buy-row-0">

        </tr>
    </table>

    <button id="start-scan-but">Start scanning
</div>`

const buyDataHtml = `
<span></span>
<button>Open</button>
<a>Buy</a>
`

const _cardClass = "css-1r8sfl";
const _cardNameClass = "css-nrp6nn"; 
const _fiatPriceClass = "css-1f6yro7";

let _currentBuyRowIndex = 0;
let _currentHeaderIndex = 0;
let _mainHeader;
let _draggable;
let _scanButton;

class BuyTableData {
    #nameElem;
    #maxScanPriceElem;
    #maxBuyPriceElem;

    constructor(nameElem, maxScanPriceElem, maxBuyPriceElem) {
        this.#nameElem = nameElem;
        this.#maxScanPriceElem = maxScanPriceElem;
        this.#maxBuyPriceElem = maxBuyPriceElem;
    }

    GetName() {
        return this.#nameElem.value;
    }

    GetMaxScanPrice() {
        return this.#maxScanPriceElem.value;
    }

    GetMaxBuyPrice() {
        return this.#maxBuyPriceElem.value;
    }

    ParseByAll(nftCards) {
        let parsedByScan = [];
        let parsedByBuy = [];
        for (let i = 0; i < nftCards.length; i++) {
            if (nftCards[i].GetName() != this.GetName()) continue;
            let nftPrice = nftCards[i].GetPrice();
            if (nftPrice <= this.GetMaxScanPrice()) parsedByScan.push(nftCards[i]);
            if (nftPrice <= this.GetMaxBuyPrice()) parsedByBuy.push(nftCards[i]);
        }
        return {parsedByScan : parsedByScan, parsedByBuy : parsedByBuy};
    }
};

class NftCard {
    static #openTabDivClass = "css-1owz1l2";

    #priceElem;
    #name;
    #openTabElem;

    constructor(card) {
        this.cardElem = card;
        this.#priceElem = card.getElementsByClassName(_fiatPriceClass)[0];
        this.#name = card.getElementsByClassName(_cardNameClass)[0].innerHTML;
        this.#openTabElem = card.getElementsByClassName(NftCard.#openTabDivClass)[0];
    }

    GetName() {
        return this.#name;
    }

    GetPrice() {
        return NftCard.GetPrice(this.#priceElem);
    }

    OpenTab() {
        this.#openTabElem.click();
    }

    static GetPrice(priceElem) {
        return parseFloat(priceElem.innerHTML.replace(/[^\d.-]/g, ''));
    }
}

/* Scanning functions */

// Returns a unique cards array (NftCard array type)
let uniqueIndex = 0;
function GetUniqueCards() {
    let cards = [].slice.call(document.getElementsByClassName(_cardClass));
    cards.splice(0, uniqueIndex); // deleting the same cards;
    uniqueIndex += cards.length;

    let nftCards = [];
    for (let i = 0; i < cards.length; i++) {
        nftCards.push(new NftCard(cards[i]));
    }

    return nftCards;
}

function ParseCardsByScan(cardsArr, maxScanPrice) {
    let parsedNftCards = [];
    for (let i = 0; i <= cardsArr.length; i++) {
        let nftCard = new NftCard(cardsArr[i]);
        if (nftCard.GetPrice() <= maxScanPrice) {
            parsedNftCards.push(nftCard);
        }
    }
    return parsedNftCards;
}

// Creating a new table coloumn
function AddColoumn() {
    let oldLastColoumn = document.querySelector("#mainheader-" + _currentHeaderIndex);
    let newLastColoumn = oldLastColoumn.cloneNode(true);
    _currentHeaderIndex++;
    newLastColoumn.id = "mainheader-" + _currentHeaderIndex;

    oldLastColoumn.after(newLastColoumn);

    // Inserting td in existing buy rows
    for (let row = 0; row <= _currentBuyRowIndex; row++) {
        let td = document.createElement(td);
        td.id = 'buy-data-' + _currentHeaderIndex + '-' + row;
        document.querySelector('#buy-row-' + row).after(td);
    }
}

// Creating a 'count' new rows
function CreateNewBuyRows(count) {
    let lastRow = document.querySelector('#buy-row-' + _currentBuyRowIndex);
    for (let row = _currentBuyRowIndex + 1; row <= count; row++) {
        lastRow.after(lastRow);

        // Creating td by a quantity of existing headers into row
        for (let i = 0; i <= _currentHeaderIndex; i++) {
            let td = document.createElement('td');
            td.id = 'buy-data-' + _currentHeaderIndex + '-' + i;
            lastRow.appendChild(td);
        }

        _currentBuyRowIndex++;
        lastRow.id = 'buy-row-' + _currentBuyRowIndex;
        lastRow = document.querySelector('#buy-row-' + _currentBuyRowIndex);
    }
}

async function StartScanning() {
    let tableDatas = [];
    for (let i = 0; i <= _currentHeaderIndex; i++) {
        tableDatas.push(GetColoumnData(document.querySelector('#mainheader-' + i)))
    }

    let newNftCards = GetUniqueCards();
    for (let col = 0; col < tableDatas.length; col++) {
        let result = tableDatas[col].ParseByAll(newNftCards);
        CreateNewBuyRows(result.parsedByScan.length - _currentBuyRowIndex);

        for (let row = 0; row < result.parsedByScan; row++) {
            let buyData = document.querySelector('#buy-data' + col + '-' + row);
            buyData.innerHTML = buyDataHtml;
            buyData.getElementsByTagName('span')[0].innerHTML = result.parsedByScan[row].GetPrice();
            buyData.getElementsByTagName('button')[0].onclick = result.parsedByScan[row].OpenTab;

            let insertRow = document.querySelector('buy-row-' + row);
            insertRow.appendChild(buyData);
        }
    }
}

/* */

/* Plate functions */

function GetColoumnData(coloumnElem) {
    return new BuyTableData(
        coloumnElem.querySelector('#name'),
        coloumnElem.querySelector('#max-scan-price'),
        coloumnElem.querySelector('#max-buy-price'));
}

function GetElements() {
    _buyDataTemplate = document.querySelector('#buy-data');
}



function CreateStartContainer() {
    let container = document.createElement("div");
    
    container.style.position = 'fixed';
    container.style.bottom = '25%';
    container.style.right = '20%';
    container.innerHTML = html;

    document.body.appendChild(container);
}

/* */

window.addEventListener("load", function() {
    CreateStartContainer();
    GetElements();

    this.document.querySelector(".new-coloumn-but")
        .addEventListener("click", AddColoumn);

    _draggable = document.querySelector("#draggable-container");
    let dragHeader = _draggable.querySelector("#draggable-header");
    dragHeader.onmousedown = dragMouseDown;

    _scanButton = document.querySelector('#start-scan-but');
    _scanButton.addEventListener("click", StartScanning);
});

/* Dragging functions */

let _pos1 = 0, _pos2 = 0, _pos3 = 0, _pos4 = 0;

function dragMouseDown(e) {
  e = e || window.event;
  e.preventDefault();
  // get the mouse cursor position at startup:
  _pos3 = e.clientX;
  _pos4 = e.clientY;
  document.onmouseup = closeDragElement;
  // call a function whenever the cursor moves:
  document.onmousemove = elementDrag;
}

function elementDrag(e) {
  e = e || window.event;
  e.preventDefault();
  // calculate the new cursor position:
  _pos1 = _pos3 - e.clientX;
  _pos2 = _pos4 - e.clientY;
  _pos3 = e.clientX;
  _pos4 = e.clientY;
  // set the element's new position:
  _draggable.style.top = (_draggable.offsetTop - _pos2) + "px";
  _draggable.style.left = (_draggable.offsetLeft - _pos1) + "px";
}

function closeDragElement() {
  // stop moving when mouse button is released:
  document.onmouseup = null;
  document.onmousemove = null;
}

/* */