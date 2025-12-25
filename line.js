import { selectedElement, selectedElementBonds, locateGrid, lineObjectMatch, ElementObjectMatch, checkAllForBlockage, selectedLineBonds, removeClickableLines, lineArray, retractElements, refreshAllLines, refreshName} from "./main.js"
import { Element } from "./element.js"
export class Line {
    constructor(orientation, location, bonds, parent) {
        this.orientation = orientation
        this.x = parseInt(location.dataset.x)
        this.y = parseInt(location.dataset.y)
        this.element = undefined
        this.bonds = bonds
        this.parent = parent
    }

    addElement() {
        let lineObj = lineObjectMatch(this)
        let sideGrids = lineObj.scan()
        let oldGrid = sideGrids.filter(g => {return g.children.length > 0})[0]
        let newGrid = sideGrids.filter(g => {return g.children.length == 0})[0]

        let oldObj = ElementObjectMatch(oldGrid.children[0])
        let newObj
        let r = 2
        
        newObj = new Element(selectedElement, newGrid, selectedElementBonds);

        if (parseInt(newGrid.dataset.x) > lineObj.x) { // old left new right
            oldObj.checkForExpansion(newObj, 'right')
            oldObj.right = newObj
            newObj.left = oldObj
            oldObj.rightBond = selectedLineBonds
            newObj.leftBond = selectedLineBonds
        } else if (parseInt(newGrid.dataset.x) < lineObj.x) { // new left old right
            oldObj.checkForExpansion(newObj, 'left')

            oldObj.left = newObj
            newObj.right = oldObj
            oldObj.leftBond = selectedLineBonds
            newObj.rightBond = selectedLineBonds
        } else if (parseInt(newGrid.dataset.y) > lineObj.y) { // old up new down
            oldObj.checkForExpansion(newObj, 'down')

            oldObj.down = newObj
            newObj.up = oldObj
            oldObj.lowerBond = selectedLineBonds
            newObj.upperBond = selectedLineBonds
        } else if (parseInt(newGrid.dataset.y) < lineObj.y)  { // new up old down
            oldObj.checkForExpansion(newObj, 'up')

            oldObj.up = newObj
            newObj.down = oldObj
            oldObj.upperBond = selectedLineBonds
            newObj.lowerBond = selectedLineBonds
        }

        lineObj.element.classList.remove('clickable')
        lineObj.element.removeEventListener('click', lineObj.addElement)
        if (selectedElementBonds == 1) {
            newObj.displayElement()
            if (oldObj.bonds == oldObj.lowerBond + oldObj.upperBond + oldObj.leftBond + oldObj.rightBond) {
                let clickableLines = lineArray.filter(l => {return l.parent == oldObj && l.element.classList.contains("clickable")})
                for (const line of clickableLines) {
                    line.delete()
                }
            }
        } else {
            removeClickableLines()
            checkAllForBlockage(newObj)
            newObj.displayElement()
            checkAllForBlockage()
            retractElements()
            refreshAllLines()
        }
        refreshName()
    }

    updatePosition() {
        if (this.element == undefined) return
        this.x = parseInt(this.element.parentElement.dataset.x)
        this.y = parseInt(this.element.parentElement.dataset.y)
    }

    scan() {
        if (this.orientation == 'v') {
            let upperGrid = locateGrid(this.x, this.y - 1)
            let lowerGrid = locateGrid(this.x, this.y + 1)
            return [upperGrid, lowerGrid]
        }
        if (this.orientation == 'h') {
            let leftGrid = locateGrid(this.x - 1, this.y)
            let rightGrid = locateGrid(this.x + 1, this.y)
            return [leftGrid, rightGrid]
        }
    }

    displayLine() {
        const lineElem = document.createElement('div');
        let grid = locateGrid(this.x, this.y)
        
        lineElem.classList.add('multi')
        for (let i = 0; i < this.bonds; i++) {
            const line = document.createElement('div');
            line.classList.add(this.orientation)
            lineElem.appendChild(line)
        }
        lineElem.style.flexDirection = (this.orientation == 'v')? 'row': "column";

        this.element = lineElem
        grid.appendChild(lineElem)
    }

    checkClickability() {
        this.updatePosition()
        let sideGrids = this.scan()
        let emptyGrid = sideGrids.filter(g => {return g.children.length == 0})
        if (emptyGrid.length > 0) {
            this.element.addEventListener('click', this.addElement)
            this.element.classList.add('clickable')
        }
    }

    delete() {
        this.element.parentElement.removeChild(this.element)
        let index = lineArray.indexOf(this)
        lineArray.splice(index, 1)
    }

    elementScan() {
        let parent = this.parent
        let otherElem

        if (parent.x > this.x) {
            otherElem = parent.left
        }

        if (parent.x < this.x) {
            otherElem = parent.right
        }

        if (parent.y > this.y) {
            otherElem = parent.up
        }

        if (parent.y < this.y) {
            otherElem = parent.down
        }

        return [parent, otherElem]
    }
}