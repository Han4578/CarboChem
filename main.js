import { Line } from "./line.js"
import { Element } from "./element.js"
import { Name } from "./name.js"

let container = document.querySelector('.container')
let resetButton = document.querySelector('.reset')
let autoButton = document.querySelector('.auto')
let cycloButton = document.querySelector('.cyclo')
let deleteButton = document.querySelector('.delete')
let elementButton = document.querySelector('.element-button')
let elementMenu = document.querySelector('.element-menu')
let elementSelection = document.querySelectorAll('.element-selection')
let lineButton = document.querySelector('.line-button')
let lineMenu = document.querySelector('.line-menu')
let darken = document.querySelector('.darken')
let question = document.querySelector('.question')
let more = document.querySelector('.more')
let moreMenu = document.querySelector('.more-menu')
let tutorial = document.querySelector('.tutorial')
let plus = document.querySelector('.plus')
let minus = document.querySelector('.minus')
let nameContainer = document.querySelector('.name')
let copy = document.querySelector('.copy')
let lineSelection = document.querySelectorAll('.line-selection')
let sections = document.querySelectorAll('.section')
let main = document.querySelector("[data-main-button]")
export let gridArray = []
export let rowArray = []
export let elementDictionary = {}
export let lineDictionary = {}
export let deleteMode = false
export let cycloMode = false
export let highlight = false
export let lineArray = []
export let cycloArray = []
export let elementArray = []
export let cycloElementArray = []
export let selectedElement = 'C'
export let selectedElementBonds = 4
export let selectedLineBonds = 1
export let gridSize = 50
let columnNum = 5
let rowNum = 5

function reset() { 
    container.innerHTML = ''
    gridArray = []
    rowArray = []
    lineArray = []
    elementArray = []
    cycloElementArray = []
    columnNum = 5
    rowNum = 5
    changeElementSelection('C', 4)
    container.classList.remove('start-up')
    container.classList.remove('start-left')
    deleteMode = false
    elementDictionary = {}
    lineDictionary = {}

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
    refreshName()
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
    row.dataset.row = rowArray.length + 1

    c.appendChild(row)
    rowArray.push(row)
    return row
}

export function locateGrid(x, y) {return gridArray.filter(g => {return parseInt(g.dataset.x) == x && parseInt(g.dataset.y) == y})[0]}

export function refreshClickableLines() {
    for (const lineObj of lineArray) {
        lineObj.element.removeEventListener('click', lineObj.addElement)
        lineObj.element.classList.remove('clickable')
        lineObj.checkClickability()
    }
}

function refreshOuterLines() {
    removeClickableLines()
    
    for (const element of elementArray) {
        element.refreshLines()
    }
}

export function removeClickableLines() {
    let clickableLines = lineArray.filter(l => {return l.element.classList.contains('clickable')})
    for (const line of clickableLines) {
        line.delete()
    }
    if (selectedLineBonds <= selectedElementBonds) {
        for (const element of elementArray) {
            element.refreshLines(false)
        }
    }
}

export function refreshAllLines(refreshClickable = true) {
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
                lineArray.push(new Line('v', locateGrid(smallerObj.x, i), biggerObj.upperBond, smallerObj) )
            }
        } else {
            for (let i = smallerObj.x + 1; i < biggerObj.x; i++) {
                lineArray.push(new Line('h', locateGrid(i, smallerObj.y), biggerObj.leftBond, smallerObj) )
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

export function checkAllForBlockage(newObj = undefined) {
    let hasChanged = false
    let originalLineBond = selectedLineBonds
    if (selectedLineBonds !== 1) changeLineSelection(1)
    do {                    //check if 2 lines occupy the same empty grid
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
            elementToPush = [ElementObjectMatch(locateGrid(x + 2, y).children[0]) ?? ElementObjectMatch(locateGrid(x - 2, y).children[0]), 'down']

            else elementToPush = [ElementObjectMatch(locateGrid(x + 2, y).children[0]), 'right']

            let elemObj = elementToPush[0]
            let direction = elementToPush[1]
            if (direction == 'left' || direction == 'up') {
                newLine(direction, 2)
            } 
            move(direction, [elemObj], 2)
            if (newObj !== undefined) {
                if (newObj.left !== undefined || newObj.right !== undefined) {
                    newObj.x = (newObj.left !== undefined)? newObj.left.x + 2: newObj.right.x - 2
                } else newObj.y = (newObj.up !== undefined)? newObj.up.y + 2: newObj.down.y - 2
            }
            elemObj.backTrace(direction, elemObj)
        
            refreshAllLines(false)
            hasChanged = true
            break
        }
        if (hasChanged) continue

        let intersectingLines = [] //check if perpendicular lines block each other
    
        for (const line of lineArray) {
            let sideGrids = line.scan().filter(l => {return l.children.length > 0})
            if (sideGrids.length !== 2) continue

            
            for (const grid of sideGrids) {
                if (grid.children[0].classList.contains('element')) continue
                
                let lineObj = lineObjectMatch(grid.children[0])
                if (line.orientation !== lineObj.orientation) intersectingLines.push([line, lineObj])
            }
        }

        for (const array of intersectingLines) {
            array.sort((a, b) => {return a.x - b.x})
            array.sort((a, b) => {return a.y - b.y})
            let smallerLine = array[0]
            let biggerLine = array[1]

            let connectedElementObj = biggerLine.parent

            if (biggerLine.x == smallerLine.x) {
                move('down', [connectedElementObj], 2)
                connectedElementObj.backTrace('down', connectedElementObj)
            } else {
                move('right', [connectedElementObj], 2)
                connectedElementObj.backTrace('right', connectedElementObj)
            }

            refreshAllLines()
            hasChanged = true
            break
        }

        if (hasChanged) continue

        let doubleChildrenGrids = gridArray.filter(g => {return g.children.length == 2})

        for (const grid of doubleChildrenGrids) { //check for overlaps with lines and elements
            if (Array.from(grid.children).every(e => {return e.classList.contains('element')})) {
                let elemObj1 = ElementObjectMatch(grid.children[0])
                let elemObj2 = ElementObjectMatch(grid.children[1])

                let parent1 = elemObj1.neighbourScan()[0]
                let parent2 = elemObj2.neighbourScan()[0]

                if (parent1.x > parent2.x) {
                    move("right", [elemObj1], 2)
                    elemObj1.backTrace("right", elemObj1)
                } else if (parent1.x < parent2.x) {
                    move("right", [elemObj2], 2)
                    elemObj2.backTrace("right", elemObj2)
                } else if (parent1.y > parent2.y) {
                    move("down", [elemObj1], 2)
                    elemObj1.backTrace("down", elemObj1)
                } else if (parent1.y < parent2.y) {
                    move("down", [elemObj2], 2)
                    elemObj2.backTrace("down", elemObj2)
                } 
            } else {
                let line = [...grid.children].filter(c => {return c.classList.contains('multi')})[0]
                let element = [...grid.children].filter(c => {return c.classList.contains('element')})

                if (element == []) continue
                let lineObj = lineObjectMatch(line)
                let connectedElementObj = lineObj.parent

                if (lineObj.orientation == 'v') {
                    move('right', [connectedElementObj], 2)
                    connectedElementObj.backTrace('right', connectedElementObj)

                } else {
                    move('down', [connectedElementObj], 2)
                    connectedElementObj.backTrace('down', connectedElementObj)

                }
            }
            hasChanged = true
            refreshAllLines()
            break
        }

        if (hasChanged) continue

        let clickableElements = elementArray.filter(e => {return e.bonds - (e.leftBond + e.rightBond + e.upperBond + e.lowerBond) !== 0})

        for (const element of clickableElements) { // check if elements are blocking clickable lines
            if (element.left == undefined) {
                let leftGrid = locateGrid(element.x - 2, element.y)
    
                if (leftGrid.children.length > 0 && leftGrid.children[0].classList.contains('element')) {
                    move('right', [element], 2)
                    element.backTrace('right', element)
                    hasChanged = true
                    refreshAllLines()
                }
            }
            
            if (element.right == undefined) {
                let rightGrid = locateGrid(element.x + 2, element.y)
    
                if (rightGrid.children.length > 0 && rightGrid.children[0].classList.contains('element')) {
                    let rightObj = ElementObjectMatch(rightGrid.children[0])

                    move('right', [rightObj], 2)
                    rightObj.backTrace('right', rightObj)
                    hasChanged = true
                    refreshAllLines()
                }
            }
            
            if (element.up == undefined) {
                let upperGrid = locateGrid(element.x, element.y - 2)
    
                if (upperGrid.children.length > 0 && upperGrid.children[0].classList.contains('element')) {
                    move('down', [element], 2)
                    element.backTrace('down', element)
                    hasChanged = true
                    refreshAllLines()
                }
            }
            
            if (element.down == undefined) {
                let lowerGrid = locateGrid(element.x, element.y + 2)
    
                if (lowerGrid.children.length > 0 && lowerGrid.children[0].classList.contains('element')) {
                    let lowerObj = ElementObjectMatch(lowerGrid.children[0])
                    move('down', [lowerObj], 2)
                    lowerObj.backTrace('down', lowerObj)
                    hasChanged = true
                    refreshAllLines()
                }
            } 
        }
    } while (hasChanged)
    if (originalLineBond !== 1) changeLineSelection(originalLineBond)
    refreshClickableLines()
}

export function newLine(direction, n = 1) {
    if (direction == 'left' || direction == 'right') {
        for (let i = 0; i < n; i++) {            
            for (const row of rowArray) {
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
        move('right', "all", n)
    }
    
    if (direction == 'up') {
        move('down', "all", n)
    }
}

export function move(direction, stuff, steps) {
    if (stuff == "all") stuff = lineArray.concat(elementArray).concat(cycloElementArray)
    else stuff = [...new Set(stuff)]
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
        if (s.element !== undefined) newGrid.appendChild(s.element)

        s.x = x
        s.y = y
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

export function changeDelete() {
    deleteButton.classList.toggle('selected')
    deleteMode = !deleteMode
    if (deleteMode) { //turn on
        if (cycloMode) changeCyclo()
        for (const lineObj of lineArray) {
            lineObj.element.removeEventListener('click', lineObj.addElement)
            lineObj.element.classList.remove('clickable')
        }
        refreshDeletion()
    } else { //turn off
        let deletableElements = elementArray.filter(e => {return e.element.classList.contains("deletable")})
        for (const elemObj of deletableElements) {
            elemObj.element.classList.remove('deletable')
            elemObj.element.removeEventListener('click', elemObj.delete)
        }
        if (selectedLineBonds <= selectedElementBonds) {
            for (const element of elementArray) {
                element.refreshLines()
            }
        }
        refreshClickableLines()
    }
}

export function changeCyclo() {
    cycloButton.classList.toggle('selected')
    cycloMode = !cycloMode
    if (cycloMode) { //turn on
        if (deleteMode) changeDelete()
    }
}

export function refreshDeletion() {
    for (const element of elementArray) {
        element.checkForDeletion()
    }
    let clickableLines = lineArray.filter(l => {return l.scan().filter(g => {return g.children.length == 0}).length > 0})
    for (const line of clickableLines) {
        line.delete()
    }
}

export function retractElements() {
    let singleBondElements = elementArray.filter(e => {return e.bonds == 1})
    let refreshNeeded = false

    for (const element of singleBondElements) {
        if (element.left !== undefined) {
            if (element.x !== element.left.x + 2) {
                element.x = element.left.x + 2
                let grid = locateGrid(element.x, element.y)

                grid.appendChild(element.element)
                refreshNeeded = true
            }
        } else if (element.right !== undefined) {
            if (element.x !== element.right.x - 2) {
                element.x = element.right.x - 2
                let grid = locateGrid(element.x, element.y)

                grid.appendChild(element.element)
                refreshNeeded = true
            }
        } else if (element.up !== undefined) {
            if (element.y !== element.up.y + 2) {
                element.y = element.up.y + 2
                let grid = locateGrid(element.x, element.y)

                grid.appendChild(element.element)
                refreshNeeded = true
            }
        } else if (element.down !== undefined) {
            if (element.y !== element.down.y - 2) {
                element.y = element.down.y - 2
                let grid = locateGrid(element.x, element.y)

                grid.appendChild(element.element)
                refreshNeeded = true
            }
        } 
    }

    if (refreshNeeded) refreshAllLines()
}

export function trimEdges() {
    if (gridArray.length <= 25) return
    let thirdColumn = rowArray.map(r => {return r.children[2]})
    let thirdLastColumn = rowArray.map(r => {return r.children[r.children.length - 3]})
    let thirdRow = [...rowArray[2].children]
    let thirdLastRow = [...rowArray[rowArray.length - 3].children]

    while (thirdLastColumn.filter(g => {return g.children.length == 1}).length == 0) {
        for (const row of rowArray) {
            let grid = row.children[row.children.length - 1]
            row.removeChild(grid)

            let index = gridArray.indexOf(grid)
            gridArray.splice(index, 1)
        }
        thirdLastColumn = rowArray.map(r => {return r.children[r.children.length - 3]})
        columnNum--
    }

    while (thirdColumn.filter(g => {return g.children.length == 1}).length == 0) {
        move('left', "all", 1)

        for (const row of rowArray) {
            let grid = row.children[row.children.length - 1]
            row.removeChild(grid)

            let index = gridArray.indexOf(grid)
            gridArray.splice(index, 1)
        }
        thirdColumn = rowArray.map(r => {return r.children[2]})
        columnNum--
    }

    while (thirdLastRow.filter(g => {return g.children.length == 1}).length == 0) {
        let row = rowArray[rowArray.length - 1]

        for (const grid of [...row.children]) {           
            let index = gridArray.indexOf(grid)
            gridArray.splice(index, 1)
        }
        rowArray.pop()
        container.removeChild(row)
        thirdLastRow = [...rowArray[rowArray.length - 3].children]
        rowNum--
    }

    while (thirdRow.filter(g => {return g.children.length == 1}).length == 0) {
        move('up', "all", 1)
        let row = rowArray[rowArray.length - 1]

        for (const grid of [...row.children]) {           
            let index = gridArray.indexOf(grid)
            gridArray.splice(index, 1)
        }
        rowArray.pop()
        container.removeChild(row)
        thirdRow = [...rowArray[2].children]
        rowNum--
    }
    checkScreenSize()
}

function autoFillHydrogen() {
    let originalElement = selectedElement
    let originalElementBond = selectedElementBonds
    let originalLineBond = selectedLineBonds
    let hasChanged = true
    changeElementSelection('H', 1)
    changeLineSelection(1)

    while (hasChanged) {
        let clickableLines = lineArray.filter(l => {return l.scan().filter(g => {return g.children.length == 0}).length == 1})
        hasChanged = false
        if (clickableLines.length > 0) {
            clickableLines[0].addElement()
            hasChanged = true
        }
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

export async function refreshName() {
    let type = document.querySelector("[data-type]")
    let formula = document.querySelector("[data-formula]")
    let name = '-'
    let length = 0
    let carbonChains = []
    let carbons = elementArray.filter(e => {return e.name == 'C'})
    let hasHighlight = highlight
    formula.innerText = "-"
    Name.type = "-"
    Name.main = []
    
    
    for (const element of elementArray) {
        if (element.leftBond + element.rightBond + element.upperBond + element.lowerBond !== element.bonds) {
            nameContainer.innerText = name
            type.innerText = "-"
            formula.innerText = "-"
            return
        }
    }
    if (hasHighlight) highlightMain()
    
    let doubleLines = lineArray.filter(l => {return l.bonds == 2})
    let tripleLines = lineArray.filter(l => {return l.bonds == 3})

    Name.doubleLineCarbons = doubleLines.map(l => {return l.elementScan()})
    Name.tripleLineCarbons = tripleLines.map(l => {return l.elementScan()})

    elementDictionary = {}
    lineDictionary = {}

    for (const element of elementArray) { //element dictionary
        let name = element.name
        elementDictionary[name] = (elementDictionary.hasOwnProperty(name))? elementDictionary[name] + 1: 1;
    }

    for (const line of lineArray) { //line dictionary
        let bonds = line.bonds
        lineDictionary[bonds] = (lineDictionary.hasOwnProperty(bonds))? lineDictionary[bonds] + 1: 1;
    }

    for (const carbon of carbons) { //get all carbon chains
        let neighbourCarbons = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name == 'C'})
        if (neighbourCarbons.length > 1) continue

        let branch = carbon.carbonTrace(carbon)
        if (branch.length > 1) {
            for (const b of branch) {
                carbonChains.push([carbon].concat(b))
            }
        } else carbonChains.push([carbon].concat(...branch))
    }

    for (const chain of carbonChains) { //find longest chain length
        if (chain.length > length) length = chain.length
    }

    if (!elementDictionary.hasOwnProperty('O')) {
        if (lineDictionary[2] > 0 && lineDictionary[3] > 0) Name.type = "Enyne"
        else if (lineDictionary[2] > 0) Name.type = "Alkene"
        else if (lineDictionary[3] > 0) Name.type = "Alkyne"
        else Name.type = "Alkane"
        let chain = Name.hydrocarbonFilter(length, carbonChains, false, [])
        name = Name.hydrocarbonName(chain, false, [], false)
        Name.main = chain
    } else {
        let oxygens = elementArray.filter(e => {return e.name == "O"})
        if (!oxygens.some(o => {return o.neighbourScan().some(e => {return ["O", "Cl", "Br", "I"].includes(e.name)})})) {

            let hydroxyls = oxygens.filter(o => {return o.neighbourScan().some(e => {return e.name == "H"}) && o.neighbourScan().some(e => {return e.name == "C"})})
            let carbonyls = oxygens.filter(o => {return o.neighbourScan().length == 1 && o.neighbourScan()[0].name == "C"})
            let hydroxylCarbons = hydroxyls.map(o => {return o.neighbourScan().filter(c => {return c.name == "C"})[0]})
            let carbonylCarbons = carbonyls.map(c => {return c.neighbourScan()[0]})
            let carboxylCarbons = [...new Set(hydroxylCarbons)].filter(c => {return carbonylCarbons.includes(c)})
            let ethers = oxygens.filter(o => {return o.neighbourScan().length == 2 && o.neighbourScan().every(c => {return c.name == "C"})})
            let esters = ethers.filter(o => {return o.neighbourScan().filter(c => {return carbonylCarbons.includes(c)}).length == 1})
            let anhydrides = ethers.filter(o => {return o.neighbourScan().filter(c => {return carbonylCarbons.includes(c)}).length == 2})
            let esterCarbons = esters.map(e => {return e.neighbourScan().filter(c => {return carbonylCarbons.includes(c)})[0]})
            let anhydrideCarbons = anhydrides.map(a => {return a.neighbourScan()}).flat()
            let aldehydes = carbonylCarbons.filter(c => {return c.neighbourScan().some(h => {return h.name == "H"})})
            let ketones = carbonylCarbons.filter(c => {return !aldehydes.includes(c)})
            let carbonates = [...new Set(esterCarbons)].filter(c => {return c.neighbourScan().filter(o => {return esters.includes(o)}).length > 1})
            let carboxyls = []

            for (const carbon of carboxylCarbons) {
                let O = carbon.neighbourScan().filter(o => {return o.name == "O"})
                let OH = O.filter(o => {return hydroxyls.includes(o)})[0]
                let CO = O.filter(o => {return carbonyls.includes(o)})[0]
                carboxyls.push(carbon, OH, CO)
            }

            for (const carbon of anhydrideCarbons) {
                Name.anhydrideOxygens.push(carbon.neighbourScan().filter(o => {return carbonyls.includes(o)})[0])
            }
    
            Name.aldehydes = aldehydes
            Name.anhydrides = anhydrides
            Name.carboxyls = carboxyls
            Name.carboxylCarbons = carboxylCarbons
            Name.carbonates = carbonates
            Name.carbonyls = carbonyls
            Name.carbonylCarbons = carbonylCarbons
            Name.esterCarbons = esterCarbons
            Name.hydroxyls = hydroxyls
            Name.hydroxylCarbons = hydroxylCarbons
            Name.ketones = ketones
            Name.esters = esters
            Name.ethers = ethers

            if (carbonates.length > 0) name = Name.carbonate() // carboxylic acid
            else if (carboxylCarbons.length > 0) name = Name.carboxylicAcid(carbonChains) // carboxylic acid
            else if (anhydrides.length > 0) name = Name.anhydride()                    //ester
            else if (esters.length > 0) name = Name.ester()                            //ester
            else if (aldehydes.length > 0) name = Name.aldehyde(carbonChains)          //aldehyde
            else if (ketones.length > 0) name = Name.ketone(carbonChains)                         //ketone
            else if (hydroxyls.length > 0) name = Name.alcohol(carbonChains) //alcohol
            else if (ethers.length > 0) {
                Name.type = "Ether"
                let chain = Name.hydrocarbonFilter(length, carbonChains, false, [])
                name = Name.hydrocarbonName(chain, false, [], false)
                Name.main = chain
            }

        } else alert("Excluded structures detected, please check tutorial for more info (Excluded names).")
    }

    let array = []

    for (const key in elementDictionary) {
        const number = elementDictionary[key];
        array.push((number > 1)? key + "<sub>" + number + "</sub>": key)
    }

    array.sort()

    if (hasHighlight) highlightMain()
    nameContainer.innerText = name
    type.innerText = Name.type
    formula.innerHTML = array.join("")
}


resetButton.addEventListener('click', reset)
autoButton.addEventListener('click', autoFillHydrogen)
window.addEventListener('resize', checkScreenSize)
deleteButton.addEventListener('click', changeDelete)
cycloButton.addEventListener('click', changeCyclo)
plus.addEventListener('click', zoom)
minus.addEventListener('click', shrink)
more.addEventListener('click', () => {
    moreMenu.classList.toggle("show")
})
question.addEventListener('click', () => {
    darken.classList.toggle('show')
})
darken.addEventListener('click', () => {
    darken.classList.remove('show')
})
tutorial.addEventListener('click', () => {
    event.stopPropagation()
})

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

copy.addEventListener("click", () => {
    navigator.clipboard.writeText(nameContainer.innerText)
    copy.classList.add("green")
})

copy.addEventListener("mouseout", () => {
    copy.classList.remove("green")
})

main.addEventListener("click", highlightMain)

export function highlightMain() {
    let elements = [...new Set(Name.main)]
    for (const element of elements) {
        element.element.classList.toggle("highlight")
    }
    main.src = (main.src.includes("hide.png"))? "images/show.png" : "images/hide.png"
    highlight = !highlight
}

function zoom() {
    if (gridSize == 20) {
        minus.addEventListener('click', shrink)
    }
    
    gridSize += 10
    document.documentElement.style.setProperty('--width', gridSize)

    if (gridSize == 100) {
        plus.removeEventListener('click', zoom)
        plus.classList.add('greyed')
    } 
    minus.classList.remove('greyed')
    checkScreenSize()
}

function shrink() {
    if (gridSize == 100) {
        plus.addEventListener('click', zoom)
    }
    
    gridSize -= 10
    document.documentElement.style.setProperty('--width', gridSize)

    if (gridSize == 20) {
        minus.removeEventListener('click', shrink)
        minus.classList.add('greyed')
    } 
    plus.classList.remove('greyed')
    checkScreenSize()
}

function toggleSection(e) {
    let details = document.querySelector("#" + e.target.dataset.id)
    details.classList.toggle("show")
}

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

for (const section of sections) {
    section.addEventListener('click', toggleSection)
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
        case 'I':
        case 'i':
            changeElementSelection('I', 1)
            changeLineSelection(1)
            break;
        case 'L':
        case 'l':
            changeElementSelection('Cl', 1)
            changeLineSelection(1)
            break;
        case 'B':
        case 'b':
            changeElementSelection('Br', 1)
            changeLineSelection(1)
            break;
        case 'O':
        case 'o':
            changeElementSelection('O', 2)
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
zoom()
shrink()