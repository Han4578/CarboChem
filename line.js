import { selectedElement, selectedBonds, locateGrid, lineObjectMatch, ElementObjectMatch, checkAllForBlockage } from "./main.js"
import { Element } from "./element.js"

export class Line {
    constructor(orientaion, location) {
        this.orientaion = orientaion
        this.x = parseInt(location.dataset.x)
        this.y = parseInt(location.dataset.y)
        this.element = undefined
    }

    addElement() {
        let lineObj = lineObjectMatch(this)
        let sideGrids = lineObj.scan()
        let oldGrid = sideGrids.filter(g => {return g.children.length > 0})[0]
        let newGrid = sideGrids.filter(g => {return g.children.length == 0})[0]

        let oldObj = ElementObjectMatch(oldGrid.children[0])
        let newObj = new Element(selectedElement, newGrid, selectedBonds);

        if (parseInt(newGrid.dataset.x) > lineObj.x) { // old left new right
            oldObj.right = newObj
            newObj.left = oldObj
        }
        if (parseInt(newGrid.dataset.x) < lineObj.x) { // new left old right
            oldObj.left = newObj
            newObj.right = oldObj
        }
        if (parseInt(newGrid.dataset.y) > lineObj.y) { // old up new down
            oldObj.down = newObj
            newObj.up = oldObj
        }
        if (parseInt(newGrid.dataset.y) < lineObj.y)  { // new up old down
            oldObj.up = newObj
            newObj.down = oldObj
        }
        newObj.displayElement()
        oldObj.checkForExpansion(newObj)
        checkAllForBlockage()
    }

    updatePosition() {
        if (this.element == undefined) return
        this.x = parseInt(this.element.parentElement.dataset.x)
        this.y = parseInt(this.element.parentElement.dataset.y)
    }

    scan() {
        if (this.orientaion == 'v') {
            let upperGrid = locateGrid(this.x, this.y - 1)
            let lowerGrid = locateGrid(this.x, this.y + 1)
            return [upperGrid, lowerGrid]
        }
        if (this.orientaion == 'h') {
            let leftGrid = locateGrid(this.x - 1, this.y)
            let rightGrid = locateGrid(this.x + 1, this.y)
            return [leftGrid, rightGrid]
        }
    }

    displayLine() {
        const lineElem = document.createElement('div');
        let grid = locateGrid(this.x, this.y)
        
        lineElem.classList.add(this.orientaion)
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
}