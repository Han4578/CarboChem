import { Line } from "./line.js"
import { lineArray, locateGrid, refreshClickableLines, newLine, elementArray, move, refreshAllLines, ElementObjectMatch, lineObjectMatch, refreshDeletion, selectedLineBonds} from "./main.js"

export class Element {
    constructor(name, location, bonds) {
        this.name = name
        this.x = parseInt(location.dataset.x)
        this.y = parseInt(location.dataset.y)
        this.bonds = bonds
        this.element = undefined
        this.left = undefined
        this.right = undefined
        this.up = undefined
        this.down = undefined
        this.extendedLeft = false
        this.extendedRight = false
        this.extendedUp = false
        this.extendedDown = false
        this.leftBond = 0
        this.rightBond = 0
        this.upperBond = 0
        this.downBond = 0
    }

    refreshLines(refreshClickable) {
        let grids = this.scan()
        let emptyGrids = grids.filter(g => {return g.children.length == 0})
        let bonds = this.leftBond + this.rightBond + this.upperBond + this.downBond
        if (this.bonds - bonds >= selectedLineBonds) {
            for (const grid of emptyGrids) {
                let lineObj

                if (parseInt(grid.dataset.x) !== this.x) {
                    lineObj = new Line('h', grid, selectedLineBonds)
                } else lineObj = new Line('v', grid, selectedLineBonds)

                lineObj.displayLine()
                lineArray.push(lineObj)
            }
        }

        if (refreshClickable) refreshClickableLines()
    }

    updatePosition() {
        this.x = parseInt(this.element.parentElement.dataset.x)
        this.y = parseInt(this.element.parentElement.dataset.y)
    }

    scan() {
        if (this.x == 1) {
            newLine('left', 2)
        }
        if (this.y == 1) {
            newLine('up', 2)   
        }

        let upperGrid = locateGrid(this.x, this.y - 1)
        let lowerGrid = locateGrid(this.x, this.y + 1)
        let leftGrid = locateGrid(this.x - 1, this.y)
        let rightGrid = locateGrid(this.x + 1, this.y)

        if (rightGrid == undefined) {
            newLine('right', 2)
            rightGrid = locateGrid(this.x + 1, this.y)
        }
        if (lowerGrid == undefined) {
            newLine('down', 2)
            lowerGrid = locateGrid(this.x, this.y + 1)
        }

        return [upperGrid, lowerGrid, leftGrid, rightGrid]
    }

    displayElement() {
        const elementElem = document.createElement('div');
        let grid = locateGrid(this.x, this.y)
        
        elementElem.classList.add('element')
        elementElem.innerText = this.name
        this.element = elementElem

        grid.appendChild(elementElem)
        elementArray.push(this)

        this.refreshLines(true)
    }
    
    checkForExpansion(obj, direction) {
        if (obj.bonds == 1) return

        let refreshNeeded = false
        if (direction == 'up' || direction == 'down') {
            if (this.right !== undefined && this.right.name == 'C' && !this.extendedRight) {
                
                let ElementsToMove = [this.right, ...this.right.trace(this)].filter(e => {return e.x >= this.x})

                move('right', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedRight = true
            }
            
            if (this.left !== undefined && this.left.name == 'C' && !this.extendedLeft) {
                
                let ElementsToMove = [this, ...this.trace(this.left)].filter(e => {return e.x >= this.x})

                obj.x += 2
                move('right', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedLeft = true
            }
            
        } else {
            if (this.down !== undefined && this.down.name == 'C' && !this.extendedDown) {

                let ElementsToMove = [this.down, ...this.down.trace(this)].filter(e => {return e.y >= this.y})
                
                move('down', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedDown = true
            }

            if (this.up !== undefined && this.up.name == 'C' && !this.extendedUp) {

                let ElementsToMove = [this, ...this.trace(this.up)].filter(e => {return e.y >= this.y})

                obj.y += 2
                move('down', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedUp = true
            }

        }

        if (refreshNeeded) {
            refreshAllLines(true);
        }
    }

    checkForDeletion() {
        let deletable = false
        let carbons = elementArray.filter(e => {return e.name == 'C'})
        let noCarbon = (carbons.length == 1)? true: false;
        
        if (this.name == 'C' && noCarbon) deletable = false
        else if (this.name == 'H') deletable = true
        else {
            let neighbourElements = [this.up, this.down, this.left, this.right].filter(e => {return e !== undefined})

            if (neighbourElements.length == 1) deletable = true
            else {
                let neighbourCarbons = neighbourElements.filter(e => {return e.name == 'C'})

                if (neighbourCarbons.length == 1) deletable = true
            }
        }

        if (deletable) {
            this.element.classList.add('deletable')
            this.element.addEventListener('click', this.delete)
        } else {            
            this.element.classList.remove('deletable')
            this.element.removeEventListener('click', this.delete)
        }
    }

    delete() {
        let thisObject = ElementObjectMatch(this)
        let targets = [thisObject.up, thisObject.down, thisObject.left, thisObject.right].filter(e => {return e !== undefined && e.name == 'H'})
        let leftOvers = [thisObject.up, thisObject.down, thisObject.left, thisObject.right].filter(e => {return e !== undefined && e.name !== 'H'})
        targets.push(thisObject)

        for (const obj of targets) {
            obj.element.parentElement.removeChild(obj.element)
            let index = elementArray.indexOf(obj)
            elementArray.splice(index, 1)
        }

        for (const leftOver of leftOvers) {
            if (leftOver.left == thisObject) {
                leftOver.left = undefined
                leftOver.leftBond = 0
            }
            else if (leftOver.right == thisObject) {
                leftOver.right = undefined
                leftOver.rightBond = 0
            }
            else if (leftOver.up == thisObject) {
                leftOver.up = undefined
                leftOver.upperBond = 0
            }
            else if (leftOver.down == thisObject) {
                leftOver.down = undefined
                leftOver.downBond = 0
            }
        }

        refreshAllLines(false)
        refreshDeletion()
    }

    trace(exception) {
        let elementsToTrace = [this.left, this.right, this.up, this.down].filter(e => {return e !== undefined && e !== exception})
        let finalTraced = elementsToTrace

        for (const element of elementsToTrace) {
            let tracedElements = element.trace(this)
            finalTraced = finalTraced.concat(tracedElements)
        }

        return finalTraced
    }

    backTrace(direction, exception) {
        let neighbourElements = [this.left, this.right, this.up, this.down].filter(e => {return e !== undefined})

        for (const element of neighbourElements) {
            if (element == exception) continue
            if ((element.x == this.x && element.y == this.y) || (element.x !== this.x && element.y !== this.y)) {
                move(direction, [element], 2)
                element.backTrace(direction, this)
            }
        }
    }
}