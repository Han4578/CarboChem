import { Element } from "./element.js"
import { Line } from "./line.js"

let container = document.querySelector('.container')
let resetButton = document.querySelector('.reset')
let actions = document.querySelectorAll('.action')
let gridArray = []
let RowArray = []
export let lineArray = []
export let elementArray = []
let columnNum = 5
let rowNum = 5
let gridSize = 50
export let selectedElement = 'C'

function reset() { 
    container.innerHTML = ''
    gridArray = []
    RowArray = []
    lineArray = []
    elementArray = []
    columnNum = 5
    rowNum = 5
    changeSelection('C')
    container.classList.remove('start-up')
    container.classList.remove('start-left')

    for (let i = 0; i < 5; i++) {
        const row = addRow(container)
        for (let j = 0; j < 5; j++) {
            addGrid(row)
        }
        container.appendChild(row)
    }

    let carbon = new Element(selectedElement, gridArray[12])
    carbon.displayElement()

    refreshClickableLines()
}

function addGrid(row) {
    let grid = document.createElement('div')

    grid.classList.add('grid')
    grid.dataset.x = row.children.length + 1
    grid.dataset.y = row.dataset.row

    row.appendChild(grid)
    gridArray.push(grid)
    return grid
}

function addRow(c) {
    const row = document.createElement('div');

    row.classList.add('row')
    row.dataset.row = RowArray.length + 1

    c.appendChild(row)
    RowArray.push(row)
    return row
}

export function locateGrid(x, y) {
    return gridArray.filter(g => {return parseInt(g.dataset.x) == x && parseInt(g.dataset.y) == y})[0]
}

export function refreshClickableLines() {
    for (const lineObj of lineArray) {
        lineObj.element.removeEventListener('click', lineObj.addElement)
        lineObj.element.classList.remove('clickable')
        lineObj.checkClickability()
    }
}

export function newLine(direction) {
    if (direction == 'left' || direction == 'right') {
        for (const row of RowArray) {
            addGrid(row)
        }
        columnNum++
        checkScreenSize()
    } else {
        let row = addRow(container)
        for (let i = 0; i < columnNum; i++) {
            addGrid(row)
        }
        rowNum++
        checkScreenSize()
    }

    if (direction == 'left' || direction == 'up') {
        move(direction)
    }
}

function move(direction) {
    let stuff = elementArray.concat(lineArray)

    for (const s of stuff) {
        let grid = s.element.parentElement
        let x = parseInt(grid.dataset.x)
        let y = parseInt(grid.dataset.y)
        
        switch (direction) { //away from direction
            case 'left':
                x +=1
                break;
            case 'right':
                x -=1
                break;
            case 'up':
                y +=1
                break;
            case 'down':
                y -=1
                break;
            default:
                alert('failed to move')
                break;
        }
        let newGrid = locateGrid(x, y)
        newGrid.appendChild(s.element)

        s.updatePosition()
    }

}

function checkScreenSize() {
    if (columnNum > window.innerWidth / gridSize) container.classList.add('start-left')
    else container.classList.remove('start-left')

    if (rowNum > window.innerHeight * 0.8 / gridSize) container.classList.add('start-up')
    else container.classList.remove('start-up')
}

function changeSelection(element) {
    for (const action of actions) {
        (action.innerText == element)? action.classList.add('selected'): action.classList.remove('selected');
    }
    selectedElement = element
}


resetButton.addEventListener('click', reset)
window.addEventListener('resize', checkScreenSize)

for (const action of actions) {
    action.addEventListener('click', () => {
        changeSelection(action.innerText)
    })
}

window.addEventListener('keydown', e => {
    let key = e.key

    switch (key) {
        case 'C':
        case 'c':
            changeSelection('C')
            break;
        case 'H':
        case 'h':
            changeSelection('H')
        break;
        case 'R':
        case 'r':
            reset()
        break;
    
        default:
            break;
    }
})
reset()