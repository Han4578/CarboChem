import { Element } from "./element.js"
import { Line } from "./line.js"

let container = document.querySelector('.container')
let resetButton = document.querySelector('.reset')
let actions = document.querySelectorAll('.action')
let gridArray = []
let RowArray = []
export let lineArray = []
export let elementArray = []
export let selectedElement = 'C'
export let selectedBonds = 4
let columnNum = 5
let rowNum = 5
let gridSize = 50

function reset() { 
    container.innerHTML = ''
    gridArray = []
    RowArray = []
    lineArray = []
    elementArray = []
    columnNum = 5
    rowNum = 5
    changeSelection('C', 4)
    container.classList.remove('start-up')
    container.classList.remove('start-left')

    for (let i = 0; i < 5; i++) {
        const row = addRow(container)
        for (let j = 0; j < 5; j++) {
            addGrid(row)
        }
        container.appendChild(row)
    }

    let carbon = new Element(selectedElement, gridArray[12], 4)
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

export function refreshAllLines() {
    for (const line of lineArray) {
        line.element.parentElement.removeChild(line.element)
    }

    lineArray = []
    let neighbourArray = []
    let combinationArray = []

    for (const element of elementArray) {
        let neighbourElements = [element.left, element.right, element.up, element.down].filter(e => {return e !== undefined})

        for (const n of neighbourElements) {
            neighbourArray.push([element, n])
        }
    }

    for (let array of neighbourArray) {
        array.sort((a, b) => a.y - b.y)
        array.sort((a, b) => a.x - b.x)
    }

    neighbourArray.sort((a, b) => a[0].x - b[0].x)
    neighbourArray.sort((a, b) => a[0].y - b[0].y)
    neighbourArray.sort((a, b) => a[1].x - b[1].x)
    neighbourArray.sort((a, b) => a[1].y - b[1].y)

    for (let i = 0; i < neighbourArray.length; i = i + 2) {
        combinationArray.push(neighbourArray[i]);
    }

    for (let array of combinationArray) {
        let smallerObj = array[0]
        let biggerObj = array[1]
        
        if (biggerObj.x == smallerObj.x) {
            for (let i = smallerObj.y + 1; i < biggerObj.y; i++) {
                lineArray.push(new Line('v', locateGrid(smallerObj.x, i)) )
            }
        } else {
            for (let i = smallerObj.x + 1; i < biggerObj.x; i++) {
                lineArray.push(new Line('h', locateGrid(i, smallerObj.y)) )
            }            
        }

    }

    for (const line of lineArray) {
        line.displayLine()
    }

    for (const element of elementArray) {
        element.refreshLines()
    }

    refreshClickableLines()
}

export function newLine(direction, n = 1) {
    if (direction == 'left' || direction == 'right') {
        for (let i = 0; i < n; i++) {            
            for (const row of RowArray) {
                addGrid(row)
            }
            columnNum++
        }
        checkScreenSize()
    } else {
        for (let i = 0; i < n; i++) {            
            let row = addRow(container)
            for (let i = 0; i < columnNum; i++) {
                addGrid(row)
            }
            rowNum++
        }
        checkScreenSize()
    }

    if (direction == 'left') {
        move('right', elementArray.concat(lineArray), n)
    }
    
    if (direction == 'up') {
        move('down', elementArray.concat(lineArray), n)
    }
}

export function move(direction, stuff, steps) {

    for (const s of stuff) {
        let grid = s.element.parentElement
        let x = parseInt(grid.dataset.x)
        let y = parseInt(grid.dataset.y)
        
        switch (direction) { //away from direction
            case 'right':
                x += steps
                break;
            case 'left':
                x -= steps
                break;
            case 'down':
                y += steps
                break;
            case 'up':
                y -= steps
                break;
            default:
                alert('failed to move')
                break;
        }
        let newGrid = locateGrid(x, y)
        while (newGrid == undefined) {
            newLine(direction, 1)
            newGrid = locateGrid(x, y)
        }
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

function changeSelection(element, bond) {
    for (const action of actions) {
        (action.innerText == element)? action.classList.add('selected'): action.classList.remove('selected');
    }
    selectedElement = element
    selectedBonds = bond
}

export function lineObjectMatch(element) {
    return lineArray.filter(l => {return l.element == element})[0]    
}

export function ElementObjectMatch(element) {
    return elementArray.filter(e => {return e.element == element})[0]    
}


resetButton.addEventListener('click', reset)
window.addEventListener('resize', checkScreenSize)

for (const action of actions) {
    action.addEventListener('click', () => {
        changeSelection(action.innerText, parseInt(action.dataset.bond))
    })
}

window.addEventListener('keydown', e => {
    let key = e.key

    switch (key) {
        case 'C':
        case 'c':
            changeSelection('C', 4)
            break;
        case 'H':
        case 'h':
            changeSelection('H', 1)
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