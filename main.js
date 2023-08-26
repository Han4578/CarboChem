import { Element } from "./element.js"
import { Line } from "./line.js"

let container = document.querySelector('.container')
let resetButton = document.querySelector('.reset')
let autoButton = document.querySelector('.auto')
let deleteButton = document.querySelector('.delete')
let elementButton = document.querySelector('.element-button')
let elementMenu = document.querySelector('.element-menu')
let elementSelection = document.querySelectorAll('.element-selection')
let lineButton = document.querySelector('.line-button')
let lineMenu = document.querySelector('.line-menu')
let lineSelection = document.querySelectorAll('.line-selection')
let deleteMode = false
let gridArray = []
let RowArray = []
export let lineArray = []
export let elementArray = []
export let selectedElement = 'C'
export let selectedElementBonds = 4
export let selectedLineBonds = 1
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
    changeElementSelection('C', 4)
    container.classList.remove('start-up')
    container.classList.remove('start-left')
    deleteMode = false

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

export function removeClickableLines() {
    let clickableLines = lineArray.filter(l => {return l.element.classList.contains('clickable')})
    for (const line of clickableLines) {
        line.element.parentElement.removeChild(line.element)
        let index = lineArray.indexOf(line)
        lineArray.splice(index, 1)
    }
    for (const element of elementArray) {
        if (selectedLineBonds > selectedElementBonds) break
        element.refreshLines(false)
    }
}

export function refreshAllLines(refreshClickable) {
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
                lineArray.push(new Line('v', locateGrid(smallerObj.x, i), biggerObj.upperBond) )
            }
        } else {
            for (let i = smallerObj.x + 1; i < biggerObj.x; i++) {
                lineArray.push(new Line('h', locateGrid(i, smallerObj.y), biggerObj.leftBond) )
            }            
        }

    }

    for (const line of lineArray) {
        line.displayLine()
    }

    for (const element of elementArray) {
        element.refreshLines(false)
    }

    if (refreshClickable) refreshClickableLines()
}

export function checkAllForBlockage() {
    let hasChanged = false
    do {
        hasChanged = false
        let emptyGrids = []

        for (const lineObj of lineArray) {
            let sideGrids = lineObj.scan().filter(g => {return g.children.length == 0})

            if (sideGrids.length > 0) emptyGrids.push(sideGrids[0])
        }

        for (const grid of emptyGrids) {    
            let x = parseInt(grid.dataset.x)
            let y = parseInt(grid.dataset.y)
            let upperGrid = locateGrid(x, y - 1)
            let lowerGrid = locateGrid(x, y + 1)
            let leftGrid = locateGrid(x - 1, y)
            let rightGrid = locateGrid(x + 1, y)
            let elementToPush

            let neighbourgrids = [upperGrid, lowerGrid, leftGrid, rightGrid].filter(g => {return g !== undefined && g.children.length > 0})

            if (neighbourgrids.length == 1) continue

            if (neighbourgrids.includes(lowerGrid)) 
            elementToPush = [ElementObjectMatch(locateGrid(x, y + 2).children[0]), 'down']
            
            else if (neighbourgrids.includes(upperGrid)) 
            elementToPush = [ElementObjectMatch(locateGrid(x, y - 2).children[0]), 'up']

            else elementToPush = [ElementObjectMatch(locateGrid(x + 2, y).children[0]), 'right']

            let elemObj = elementToPush[0]
            let direction = elementToPush[1]
            if (direction == 'left' || direction == 'up') {
                newLine(direction, 2)
            } 
            move(direction, [elemObj], 2)
            elemObj.backTrace(direction, elemObj)
        
            refreshAllLines(false)
            hasChanged = true
            break
        }
    } while (hasChanged)
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
        let x = s.x
        let y = s.y
        
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

    if (rowNum > window.innerHeight * 0.9 / gridSize) container.classList.add('start-up')
    else container.classList.remove('start-up')
}

function changeElementSelection(element, bond) {
    for (const action of elementSelection) {
        (action.innerText == element)? action.classList.add('selected'): action.classList.remove('selected');
    }

    elementButton.innerText = element
    elementMenu.classList.remove('show')
    
    if (deleteMode) {
        deleteButton.classList.remove('selected')
        let deletableElements = elementArray.filter(e => {return e.element.classList.contains("deletable")})
        for (const elemObj of deletableElements) {
            elemObj.element.classList.remove('deletable')
            elemObj.element.removeEventListener('click', elemObj.delete)
        }
        deleteMode = false
        refreshClickableLines()
    }
    selectedElement = element
    selectedElementBonds = parseInt(bond)
    removeClickableLines()
    refreshClickableLines()
}

function changeLineSelection(bond) {
    selectedLineBonds = parseInt(bond)
    switch (selectedLineBonds) {
        case 1:
            lineButton.src = './images/single.svg'
            break;
        case 2:
            lineButton.src = './images/double.png'
            break;
        case 3:
            lineButton.src = './images/triple.png'
            break;
        default:
            break;
    }
    if (deleteMode) {
        deleteButton.classList.remove('selected')
        let deletableElements = elementArray.filter(e => {return e.element.classList.contains("deletable")})
        for (const elemObj of deletableElements) {
            elemObj.element.classList.remove('deletable')
            elemObj.element.removeEventListener('click', elemObj.delete)
        }
        deleteMode = false
        refreshClickableLines()
    }
    removeClickableLines()
    refreshClickableLines()
}

function changeDelete() {
    deleteButton.classList.toggle('selected')
    deleteMode = !deleteMode
    if (deleteMode) {
        for (const lineObj of lineArray) {
            lineObj.element.removeEventListener('click', lineObj.addElement)
            lineObj.element.classList.remove('clickable')
        }
        refreshDeletion()
    } else {
        let deletableElements = elementArray.filter(e => {return e.element.classList.contains("deletable")})
        for (const elemObj of deletableElements) {
            elemObj.element.classList.remove('deletable')
            elemObj.element.removeEventListener('click', elemObj.delete)
        }
        refreshClickableLines()
    }
}

export function refreshDeletion() {
    for (const element of elementArray) {
        element.checkForDeletion()
    }
}

function autoFillHydrogen() {
    let originalElement = selectedElement
    let originalElementBond = selectedElementBonds
    let originalLineBond = selectedLineBonds
    changeElementSelection('H', 1)
    changeLineSelection(1)

    for (const line of lineArray) {
        if (!line.element.classList.contains('clickable')) continue
        line.addElement()
    }
    changeElementSelection(originalElement, originalElementBond)
    changeLineSelection(originalLineBond)

}

export function lineObjectMatch(element) {
    return lineArray.filter(l => {return l.element == element || l == element})[0]    
}

export function ElementObjectMatch(element) {
    return elementArray.filter(e => {return e.element == element})[0]    
}


resetButton.addEventListener('click', reset)
autoButton.addEventListener('click', autoFillHydrogen)
window.addEventListener('resize', checkScreenSize)
deleteButton.addEventListener('click', changeDelete)

window.addEventListener('click', () => {
    elementMenu.classList.remove('show')
    lineMenu.classList.remove('show')
})

elementButton.addEventListener('click', () => {
    elementMenu.classList.toggle('show')
    lineMenu.classList.remove('show')
    event.stopPropagation()
})

lineButton.addEventListener('click', () => {
    lineMenu.classList.toggle('show')
    elementMenu.classList.remove('show')
    event.stopPropagation()
})

for (const element of elementSelection) {
    element.addEventListener('click', () => {
        changeElementSelection(element.innerText, element.dataset.bond)
    })
}

for (const element of lineSelection) {
    element.addEventListener('click', () => {
        changeLineSelection(element.dataset.bond)
    })
}


window.addEventListener('keydown', e => {
    let key = e.key

    switch (key) {
        case 'C':
        case 'c':
            changeElementSelection('C', 4)
            break;
        case 'H':
        case 'h':
            changeElementSelection('H', 1)
            changeLineSelection(1)
            break;
        case 'R':
        case 'r':
            reset()
            break;
        case 'A':
        case 'a':
            autoFillHydrogen()
            break;
        case 'D':
        case 'd':
            changeDelete()
            break;
        case '1':
            changeLineSelection(1)
            break;
        case '2':
            changeLineSelection(2)
            break;
        case '3':
            changeLineSelection(3)
            break;
    
        default:
            break;
    }
})
reset()