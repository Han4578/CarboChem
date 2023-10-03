import { elementArray, lineArray, elementDictionary, lineDictionary, ElementObjectMatch } from "./main.js";

export let Name = {
    alkane() {
        let carbons = elementArray.filter(e => {return e.name == 'C'})
        let carbonChains = []
        let length = 0
        let prefix

        for (const carbon of carbons) {
            let neighbourCarbons = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name == 'C'})
            if (neighbourCarbons.length > 1) continue

            let branch = carbon.carbonTrace(carbon)
            if (branch.length > 1) {
                for (const b of branch) {
                    carbonChains.push([carbon].concat(b))
                }
            } else carbonChains.push([carbon].concat(...branch))
        }

        for (const chain of carbonChains) {
            if (chain.length > length) length = chain.length
        }
        
        let longestChains = carbonChains.filter(c => {return c.length == length})
        let lowestNumberChain = longestChains[0]
        let LowestIndex = length
        
        for (const chain of longestChains) {
            for (const carbon of chain) {
                let branches = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name !== 'H' && !chain.includes(c)})
                if (branches.length == 0) continue
                
                if (chain.indexOf(carbon) < LowestIndex)  {
                    lowestNumberChain = chain
                    LowestIndex = chain.indexOf(carbon)
                }
                break
            }
        }

        let branches = this.branch(lowestNumberChain)
        
        prefix = carbonPrefix(length)
        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b) => {return a - b})
            if (length <= 4 && ['chloro', 'bromo', 'iodo'].includes(name)) {
                numberBranchNames.push(numericalMultiplier(numArray.length) + name)
            } else numberBranchNames.push(numArray.join(', ')+ '-' + numericalMultiplier(numArray.length) + name)
        }

        return numberBranchNames.join('-') + prefix + 'ane'
    },

    alkene() {
        let carbons = elementArray.filter(e => {return e.name == 'C'})
        let doubleCarbons = carbons.filter(c => {return c.upperBond == 2 || c.lowerBond == 2 || c.leftBond == 2 || c.rightBond == 2})
        let doubleLines = lineArray.filter(l => {return l.bonds == 2})
        let carbonChains = []
        let length = 0
        let prefix
        let location = ''

        for (const carbon of carbons) {
            let neighbourCarbons = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name == 'C'})
            if (neighbourCarbons.length > 1) continue

            let branch = carbon.carbonTrace(carbon)
            if (branch.length > 1) {
                for (const b of branch) {
                    carbonChains.push([carbon].concat(b))
                }
            } else carbonChains.push([carbon].concat(...branch))
        }

        for (const chain of carbonChains) {
            if (chain.length > length) length = chain.length
        }

        let alkeneChains = carbonChains.filter(c => {return doubleCarbons.every(val => c.length == length && c.includes(val))})
        let lowestNumberChains = []
        let LowestIndex = length

        for (const chain of alkeneChains) {
            for (const carbon of chain) {
                if (carbon.upperBond == 2 || carbon.lowerBond == 2 || carbon.leftBond == 2 || carbon.rightBond == 2) {
                    if (chain.indexOf(carbon) < LowestIndex) {
                        LowestIndex = chain.indexOf(carbon)
                        lowestNumberChains = [chain]
                    } else if (chain.indexOf(carbon) == LowestIndex) {
                        lowestNumberChains.push(chain)
                    }
                    break
                }
            }
        }

        let index = length
        let lowestNumberChain = lowestNumberChains[0]

        for (const chain of lowestNumberChains) {
            for (const carbon of chain) {
                let branches = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name !== 'H' && !chain.includes(c)})
                if (branches.length == 0) continue
                
                if (chain.indexOf(carbon) < index)  {
                    lowestNumberChain = chain
                    index = chain.indexOf(carbon)
                }
                break
            }
        }
        
        let doubleLineCarbons = doubleLines.map(l => {return l.elementScan()})
        let locations = []
        
        for (const carbons of doubleLineCarbons) {
            carbons.sort((a, b) => {return lowestNumberChain.indexOf(a) - lowestNumberChain.indexOf(b)})
                locations.push(lowestNumberChain.indexOf(carbons[0]) + 1)
        }
            
        locations = [...new Set(locations)]
        locations.sort((a, b) => {return a - b})
        if (length > 3) location = "-" + locations.join() + "-"

        let enePrefix = numericalMultiplier(locations.length)
        let branches = this.branch(lowestNumberChain)
        
        prefix = carbonPrefix(length)
        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []        

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b) => {return a - b})
            if (length <= 4 && !['chloro', 'bromo', 'iodo'].includes(name)) {
                numberBranchNames.push(numericalMultiplier(numArray.length) + name)
            } else numberBranchNames.push(numArray.join(', ')+ '-' + numericalMultiplier(numArray.length) + name)
        }

        return numberBranchNames.join('-') + prefix + location + enePrefix + 'ene'
    },

    alkyne() {
        let carbons = elementArray.filter(e => {return e.name == 'C'})
        let doubleCarbons = carbons.filter(c => {return c.upperBond == 3 || c.lowerBond == 3 || c.leftBond == 3 || c.rightBond == 3})
        let doubleLines = lineArray.filter(l => {return l.bonds == 3})
        let carbonChains = []
        let length = 0
        let prefix
        let location = ''

        for (const carbon of carbons) {
            let neighbourCarbons = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name == 'C'})
            if (neighbourCarbons.length > 1) continue

            let branch = carbon.carbonTrace(carbon)
            if (branch.length > 1) {
                for (const b of branch) {
                    carbonChains.push([carbon].concat(b))
                }
            } else carbonChains.push([carbon].concat(...branch))
        }

        for (const chain of carbonChains) {
            if (chain.length > length) length = chain.length
        }

        let alkeneChains = carbonChains.filter(c => {return doubleCarbons.every(val => c.length == length && c.includes(val))})
        let lowestNumberChains = []
        let LowestIndex = length

        for (const chain of alkeneChains) {
            for (const carbon of chain) {
                if (carbon.upperBond == 3 || carbon.lowerBond == 3 || carbon.leftBond == 3 || carbon.rightBond == 3) {
                    if (chain.indexOf(carbon) < LowestIndex) {
                        LowestIndex = chain.indexOf(carbon)
                        lowestNumberChains = [chain]
                    } else if (chain.indexOf(carbon) == LowestIndex) {
                        lowestNumberChains.push(chain)
                    }
                    break
                }
            }
        }

        let index = length
        let lowestNumberChain = lowestNumberChains[0]

        for (const chain of lowestNumberChains) {
            for (const carbon of chain) {
                let branches = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name !== 'H' && !chain.includes(c)})
                if (branches.length == 0) continue
                
                if (chain.indexOf(carbon) < index)  {
                    lowestNumberChain = chain
                    index = chain.indexOf(carbon)
                }
                break
            }
        }

        let doubleLineCarbons = doubleLines.map(l => {return l.elementScan()})
        let locations = []
        
        for (const carbons of doubleLineCarbons) {
            carbons.sort((a, b) => {return lowestNumberChain.indexOf(a) - lowestNumberChain.indexOf(b)})
                locations.push(lowestNumberChain.indexOf(carbons[0]) + 1)
        }
            
        locations = [...new Set(locations)]
        locations.sort((a, b) => {return a - b})
        if (length > 3) location = "-" + locations.join() + "-"

        let enePrefix = numericalMultiplier(locations.length)
        let branches = this.branch(lowestNumberChain)
        
        prefix = carbonPrefix(length)
        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []        

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b) => {return a - b})
            if (length <= 4 && !['chloro', 'bromo', 'iodo'].includes(name)) {
                numberBranchNames.push(numericalMultiplier(numArray.length) + name)
            } else numberBranchNames.push(numArray.join(', ')+ '-' + numericalMultiplier(numArray.length) + name)
        }

        return numberBranchNames.join('-') + prefix + location + enePrefix + 'yne'
    },

    enyne() {

    },

    alkyl(branch, startingElement, mainElement) {
        let branchDictionary = {}
        let carbonChains = []
        let carbonChain

        for (const element of branch) {
            branchDictionary[element.name] = (branchDictionary.hasOwnProperty(element.name))? branchDictionary[element.name] + 1: 1;
        }

        let tracedElement = startingElement.carbonTrace(mainElement)
        if (tracedElement.length > 1) {
            for (const b of tracedElement) {
                carbonChains.push([startingElement].concat(...b))
            }
            carbonChains.sort((a, b) => {return b.length - a.length})
        } else carbonChains.push([startingElement].concat(...tracedElement))

        carbonChain = carbonChains[0]

        let number = carbonChain.length
        let branches = Name.branch(carbonChain, mainElement)
        let prefix
        
        prefix = carbonPrefix(number)

        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []
        let hasBranch = false

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b) => {return a - b})

            numberBranchNames.push(numArray.join(', ')+ '-' + numericalMultiplier(numArray.length) + name)
            hasBranch = true
        }

        return (hasBranch)? '(' + numberBranchNames.join(' ') + prefix + 'yl)': numberBranchNames.join(' ') + prefix + 'yl'
    },

    branch(carbonChain, exception) {
        let branches = []
        let number = 1

        for (const carbon of carbonChain) {
            let branchStems = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name !== 'H' && !carbonChain.includes(c) && c !== exception})
            if (branchStems.length > 0) {
                for (const branchStem of branchStems) {
                    switch (branchStem.name) {
                        case 'C':
                            let branch = branchStem.trace([carbon])
                            let name = Name.alkyl([branchStem].concat(branch), branchStem, carbon)
                            branches.push([name, number])
                            break;
                        case 'Cl':
                            branches.push(['chloro', number])
                            break;
                        case 'Br':
                            branches.push(['bromo', number])
                            break;
                        case 'I':
                            branches.push(['iodo', number])
                            break;
                    }
                }
            }
            number++
        }

        return branches
    }
}

function numericalMultiplier(number) {
    let numString = number.toString()
    let numArray = Array.from(numString)
    let finalName = ''

    numArray.reverse()

    let ones = numArray[0]
    let tens = numArray[1] ?? 0
    let hundreds = numArray[2] ?? 0
    let thousands = numArray[3] ?? 0

    switch (parseInt(ones)) {
        case 0:
            break;
        case 1:
            if (number < 10) break
            else if (number < 20) finalName += "un"
            else finalName += "hen"
            break;
        case 2:
            if (number < 10)  finalName += "di"
            else finalName += "do"
            break;
        case 3:
            finalName += "tri"
            break;
        case 4:
            finalName += "tetra"
            break;
        case 5:
            finalName += "penta"
            break;
        case 6:
            finalName += "hexa"
            break;
        case 7:
            finalName += "hepta"
            break;
        case 8:
            finalName += "octa"
            break;
        case 9:
            finalName += "nona"
            break;
        default:
            break;
    }

    switch (parseInt(tens)) {
        case 0:
            break;
        case 1:
            finalName += "deca"
            break;
        case 2:
            finalName += "icosa"
            break;
        case 3:
            finalName += "triaconta"
            break;
        case 4:
            finalName += "tetraconta"
            break;
        case 5:
            finalName += "pentaconta"
            break;
        case 6:
            finalName += "hexaconta"
            break;
        case 7:
            finalName += "heptaconta"
            break;
        case 8:
            finalName += "octaconta"
            break;
        case 9:
            finalName += "nonaconta"
            break;
        default:
            break;
    }

    switch (parseInt(hundreds)) {
        case 0:
            break;
        case 1:
            finalName += "hecta"
            break;
        case 2:
            finalName += "dicta"
            break;
        case 3:
            finalName += "tricta"
            break;
        case 4:
            finalName += "tetracta"
            break;
        case 5:
            finalName += "pentacta"
            break;
        case 6:
            finalName += "hexacta"
            break;
        case 7:
            finalName += "heptacta"
            break;
        case 8:
            finalName += "octacta"
            break;
        case 9:
            finalName += "nonacta"
            break;
        default:
            break;
    }

    switch (parseInt(thousands)) {
        case 0:
            break;
        case 1:
            finalName += "kilia"
            break;
        case 2:
            finalName += "dilia"
            break;
        case 3:
            finalName += "trilia"
            break;
        case 4:
            finalName += "tetralia"
            break;
        case 5:
            finalName += "pentalia"
            break;
        case 6:
            finalName += "hexalia"
            break;
        case 7:
            finalName += "heptalia"
            break;
        case 8:
            finalName += "octalia"
            break;
        case 9:
            finalName += "nonalia"
            break;
        default:
            break;
    }

    return finalName
}

function carbonPrefix(number) {
    let numString = number.toString()
    let numArray = Array.from(numString)
    let finalName = ''

    numArray.reverse()

    let ones = numArray[0]
    let tens = numArray[1] ?? 0
    let hundreds = numArray[2] ?? 0
    let thousands = numArray[3] ?? 0

    switch (parseInt(ones)) {
        case 0:
            break;
        case 1:
            if (number < 10) finalName += "meth"
            else if (number < 20) finalName += "un"
            else if (number == 21 || number == 101) finalName += "heni"
            else finalName += "hen"
            break;
        case 2:
            if (number < 10) finalName += "eth" 
            else finalName += "do"
            break;
        case 3:
            if (number < 10) finalName += "prop"
            else finalName += "tri"
            break;
        case 4:
            if (number < 10) finalName += "but"
            else finalName += "tetra"
            break;
        case 5:
            if (number > 10) {
                finalName += "penta"
            } else finalName += "pent"
            break;
        case 6:
            if (number > 10) {
                finalName += "hexa"
            } else finalName += "hex"
            break;
        case 7:
            if (number > 10) {
                finalName += "hepta"
            } else finalName += "hept"
            break;
        case 8:
            if (number > 10) {
                finalName += "octa"
            } else finalName += "oct"
            break;
        case 9:
            if (number > 10) {
                finalName += "nona"
            } else finalName += "non"
            break;
        default:
            break;
    }

    switch (parseInt(tens)) {
        case 0:
            break;
        case 1:
            finalName += "dec"
            break;
        case 2:
            if (number == 20 || number == 21) finalName += 'icos'
            else finalName += "cos"
            break;
        case 3:
            finalName += "triacont"
            break;
        case 4:
            finalName += "tetracont"
            break;
        case 5:
            finalName += "pentacont"
            break;
        case 6:
            finalName += "hexacont"
            break;
        case 7:
            finalName += "heptacont"
            break;
        case 8:
            finalName += "octacont"
            break;
        case 9:
            finalName += "nonacont"
            break;
        default:
            break;
    }

    switch (parseInt(hundreds)) {
        case 0:
            break;
        case 1:
            finalName += "hect"
            break;
        case 2:
            finalName += "dict"
            break;
        case 3:
            finalName += "trict"
            break;
        case 4:
            finalName += "tetract"
            break;
        case 5:
            finalName += "pentact"
            break;
        case 6:
            finalName += "hexact"
            break;
        case 7:
            finalName += "heptact"
            break;
        case 8:
            finalName += "octact"
            break;
        case 9:
            finalName += "nonact"
            break;
        default:
            break;
    }

    switch (parseInt(thousands)) {
        case 0:
            break;
        case 1:
            finalName += "kili"
            break;
        case 2:
            finalName += "dili"
            break;
        case 3:
            finalName += "trili"
            break;
        case 4:
            finalName += "tetrali"
            break;
        case 5:
            finalName += "pentali"
            break;
        case 6:
            finalName += "hexali"
            break;
        case 7:
            finalName += "heptali"
            break;
        case 8:
            finalName += "octali"
            break;
        case 9:
            finalName += "nonali"
            break;
        default:
            break;
    }

    return finalName
}