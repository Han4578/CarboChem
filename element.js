import { Line } from "./line.js"
import { lineArray, locateGrid, refreshClickableLines, newLine, elementArray, move, refreshAllLines, ElementObjectMatch, lineObjectMatch, refreshDeletion, selectedLineBonds, trimEdges, checkAllForBlockage, deleteMode, changeDelete, refreshName, highlight, highlightMain} from "./main.js"

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
        this.lowerBond = 0
    }

    refreshLines(refreshClickable) {
        let grids = this.scan()
        let emptyGrids = grids.filter(g => {return g.children.length == 0})
        let bonds = this.leftBond + this.rightBond + this.upperBond + this.lowerBond
        if (this.bonds - bonds >= selectedLineBonds) {
            for (const grid of emptyGrids) {
                let lineObj

                if (parseInt(grid.dataset.x) !== this.x) {
                    lineObj = new Line('h', grid, selectedLineBonds, this)
                } else lineObj = new Line('v', grid, selectedLineBonds, this)

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
        if (obj.bonds == selectedLineBonds) return

        let refreshNeeded = false
        if (direction == 'up' || direction == 'down') {
            if (this.right !== undefined && this.right.name == 'C' && !this.extendedRight) {
                
                let ElementsToMove = [this.right, ...this.right.trace([this])].filter(e => {return e.x >= this.x})

                move('right', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedRight = true
            }
            
            if (this.left !== undefined && this.left.name == 'C' && !this.extendedLeft) {
                
                let ElementsToMove = [this, ...this.trace([this.left])].filter(e => {return e.x >= this.x})

                obj.x += 2
                move('right', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedLeft = true
            }
            
        } else {
            if (this.down !== undefined && this.down.name == 'C' && !this.extendedDown) {

                let ElementsToMove = [this.down, ...this.down.trace([this])].filter(e => {return e.y >= this.y})
                
                move('down', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedDown = true
            }

            if (this.up !== undefined && this.up.name == 'C' && !this.extendedUp) {

                let ElementsToMove = [this, ...this.trace([this.up])].filter(e => {return e.y >= this.y})

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
        let neighbourElements = [this.up, this.down, this.left, this.right].filter(e => {return e !== undefined})
        
        switch (this.bonds) {
            case 1:
                deletable = true
                break;
            case 2:
                let greaterBondElements = neighbourElements.filter(e => {return e !== undefined && e.bonds >= this.bonds})
                if (greaterBondElements.length == 1) deletable = true
                break;
            case 4:
                let carbons = elementArray.filter(e => {return e.name == 'C'})
                let noCarbon = (carbons.length == 1)? true: false;
                let nonSingleBondElements = neighbourElements.filter(e => {return e.bonds > 1})

                if (noCarbon) deletable = false
                else if (nonSingleBondElements.length == 1) deletable = true
                break;
        
            default:
                break;
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
        let targets = [thisObject.up, thisObject.down, thisObject.left, thisObject.right].filter(e => {return e !== undefined && e.bonds == 1})
        let leftOvers = [thisObject.up, thisObject.down, thisObject.left, thisObject.right].filter(e => {return e !== undefined && !targets.includes(e)})
        targets.push(thisObject)

        for (const obj of targets) {
            obj.element.parentElement.removeChild(obj.element)
            let index = elementArray.indexOf(obj)
            elementArray.splice(index, 1)
        }

        for (const leftOver of leftOvers) {
            leftOver.checkForReduction(thisObject)

            if (targets.includes(leftOver.left)) {
                leftOver.left = undefined
                leftOver.leftBond = 0
                leftOver.extendedLeft = false
            }
            else if (targets.includes(leftOver.right)) {
                leftOver.right = undefined
                leftOver.rightBond = 0
                leftOver.extendedRight = false
            }
            else if (targets.includes(leftOver.up)) {
                leftOver.up = undefined
                leftOver.upperBond = 0
                leftOver.extendedUp = false
            }
            else if (targets.includes(leftOver.down)) {
                leftOver.down = undefined
                leftOver.lowerBond = 0
                leftOver.extendedDown = false
            }
        }

        refreshAllLines(false)
        checkAllForBlockage()
        refreshDeletion()
        trimEdges()

        if (!deleteMode) {
            changeDelete()
        }

        if (highlight) {
            highlightMain()
        }
        refreshName()
    }

    trace(exceptionArray) {
        let elementsToTrace = [this.left, this.right, this.up, this.down].filter(e => {return e !== undefined && !exceptionArray.includes(e)})
        let finalTraced = elementsToTrace

        for (const element of elementsToTrace) {
            let tracedElements = element.trace([this])
            finalTraced = finalTraced.concat(tracedElements)
        }

        return finalTraced
    }

    backTrace(direction, exception) {
        let neighbourElements = this.neighbourScan()
        for (const element of neighbourElements) {
            if (element == exception) continue
            if ((element.x == this.x && element.y == this.y) || (element.x !== this.x && element.y !== this.y)) {
                move(direction, [element], 2)
                element.backTrace(direction, this)
            }
        }
    }

    checkForReduction(deletedObj) {
        if (!this.extendedDown && !this.extendedUp && !this.extendedLeft && !this.extendedRight) return

        if ((this.up == deletedObj && (this.down == undefined || (this.down !== undefined && this.down.bonds == 1))) || (this.down == deletedObj && (this.up == undefined || (this.up !== undefined && this.up.bonds == 1)))) {
            if (this.extendedRight) {
                let ElementsToMove = [this.right, ...this.right.trace([this])].filter(e => {return e.x >= this.x})
                let movable = true

                for (const element of ElementsToMove) {
                    let grid = locateGrid(element.x - 2, element.y)
                    let elemObj

                    if (grid.children.length == 0) continue

                    let child = grid.children[0]

                    if (child.classList.contains('multi')) {
                        let lineObj = lineObjectMatch(child)
                        elemObj = lineObj.parent
                    } else elemObj = ElementObjectMatch(child)

                    if (!ElementsToMove.includes(elemObj) && elemObj !== this) {
                        movable = false
                        break
                    }
                }
                
                if (movable) {
                    move('left', ElementsToMove, 2)
                    this.extendedRight = false
                }

            }
            if (this.extendedLeft) {
                let ElementsToMove = [this, ...this.trace([this.left, deletedObj])].filter(e => {return e.x >= this.x})
                let movable = true

                for (const element of ElementsToMove) {
                    if (element == this) continue

                    let grid = locateGrid(element.x - 2, element.y)
                    let elemObj

                    if (grid.children.length == 0) continue

                    let child = grid.children[0]

                    if (child.classList.contains('multi')) {
                        let lineObj = lineObjectMatch(child)
                        elemObj = lineObj.parent
                    } else elemObj = ElementObjectMatch(child)

                    if (!ElementsToMove.includes(elemObj)) {
                        movable = false
                        break
                    }
                }
                
                if (movable) {
                    move('left', ElementsToMove, 2)
                    this.extendedLeft = false
                }
            }
        }

        if ((this.left == deletedObj && (this.right == undefined || (this.right !== undefined && this.right.bonds == 1))) || (this.right == deletedObj && (this.left == undefined || (this.left !== undefined && this.left.bonds == 1)))) {
            if (this.extendedDown) {
                let ElementsToMove = [this.down, ...this.down.trace([this])].filter(e => {return e.y >= this.y})
                let movable = true

                for (const element of ElementsToMove) {
                    let grid = locateGrid(element.x, element.y - 2)
                    let elemObj

                    if (grid.children.length == 0) continue

                    let child = grid.children[0]

                    if (child.classList.contains('multi')) {
                        let lineObj = lineObjectMatch(child)
                        elemObj = lineObj.parent
                    } else elemObj = ElementObjectMatch(child)

                    if (!ElementsToMove.includes(elemObj) && elemObj !== this) {
                        movable = false
                        break
                    }
                }

                if (movable) {
                    move('up', ElementsToMove, 2)
                    this.extendedDown = false
                }
            }
            if (this.extendedUp) {
                let ElementsToMove = [this, ...this.trace([this.up, deletedObj])].filter(e => {return e.y >= this.y})
                let movable = true

                for (const element of ElementsToMove) {
                    if (element == this) continue

                    let grid = locateGrid(element.x, element.y - 2)
                    let elemObj

                    if (grid.children.length == 0) continue

                    let child = grid.children[0]

                    if (child.classList.contains('multi')) {
                        let lineObj = lineObjectMatch(child)
                        elemObj = lineObj.parent
                    } else elemObj = ElementObjectMatch(child)

                    if (!ElementsToMove.includes(elemObj)) {
                        movable = false
                        break
                    }
                }

                if (movable) {
                    move('up', ElementsToMove, 2)
                    this.extendedUp = false
                }
            }
        }
    }

    carbonTrace(exception) {
        let elementsToTrace = [this.left, this.right, this.up, this.down].filter(e => {return e !== undefined && e !== exception && e.name == 'C'})
        let finalTraced = elementsToTrace

        if (elementsToTrace.length == 1) {
            let element = elementsToTrace[0]
            let tracedElementArrays = element.carbonTrace(this)

           if (tracedElementArrays.length == 1) {
                finalTraced = finalTraced.concat(...tracedElementArrays)
            } else if (tracedElementArrays.length > 1) {
                let branches = []

                for (const array of tracedElementArrays) {
                    let branch = [elementsToTrace[0], ...array]
                    branches.push(branch)
                }
                return branches
            }
            
            return [finalTraced]
        } else if (elementsToTrace.length > 1) {
            let branches = []

            for (const element of elementsToTrace) {
                let tracedElements = element.carbonTrace(this)

                if (tracedElements.length == 1) {
                    let branch = [element].concat(...tracedElements)
                    branches.push(branch)

                } else if (tracedElements.length > 1) {
    
                    for (const array of tracedElements) {
                        let branch = [element, ...array]
                        branches.push(branch)
                    }
                }
            }
            
            return branches
        } else return [finalTraced]
    }

    neighbourScan() {
        return [this.up, this.down, this.left, this.right].filter(e => {return e !== undefined})
    }
}