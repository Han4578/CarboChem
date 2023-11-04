import { elementArray, lineArray, elementDictionary, lineDictionary, ElementObjectMatch } from "./main.js";

export let Name = {
    alkane(length, carbonChains) {
        let longestChains = carbonChains.filter(c => {return c.length == length}) //longest chains
        let lowestBranchChains = []
        let LowestIndex = length
        
        for (const chain of longestChains) { //lowest branch index
            for (const carbon of chain) {
                let branches = carbon.neighbourScan().filter(c => {return c.name !== 'H' && !chain.includes(c)})
                if (branches.length == 0) continue
                
                if (chain.indexOf(carbon) < LowestIndex)  {
                    lowestBranchChains = [chain]
                    LowestIndex = chain.indexOf(carbon)
                } else if (chain.indexOf(carbon) == LowestIndex) lowestBranchChains.push(carbon)
                break
            }

        let numberOfBranches = 0
        let lowestNumberChain = lowestBranchChains[0]

        for (const chain of lowestBranchChains) { //most number of branches
            let branchLength = chain.map(carbon => {return carbon.neighbourScan().filter(c => {return c.name !== 'H' && c.name !== "O" && !chain.includes(c)}).length}).reduce((partialSum, a) => partialSum + a, 0)
            if (branchLength > numberOfBranches) {
                numberOfBranches = branchLength
                lowestNumberChain = chain
            }
        }
        }

        let name = this.alkaneName(lowestNumberChain)

        return name
    },

    alkaneName(lowestNumberChain) {
        let branches = this.branch(lowestNumberChain)
        let length = lowestNumberChain.length
        let prefix = carbonPrefix(length)
        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b) => {return a - b})
            numberBranchNames.push(numArray.join(',')+ '-' + numericalMultiplier(numArray.length) + name)
        }

        return numberBranchNames.join('-') + prefix + 'ane'
    },

    alkene(length, carbonChains) {
        let alkeneChains = []
        let lowestAlkeneChains = []
        let maxDB = 0
        let doubleLines = lineArray.filter(l => {return l.bonds == 2})
        let doubleLineCarbons = doubleLines.map(l => {return l.elementScan()})

        for (const chain of carbonChains) { //alkene chains with most double bonds
            let i = 0

            for (const pairs of doubleLineCarbons) {
                if (pairs.every(c => chain.includes(c))) i++
            }

            if (i > maxDB) {
                maxDB = i
                alkeneChains = [chain]
            } else if (i == maxDB) alkeneChains.push(chain)
        }

        alkeneChains.sort((a, b) => {return b.length - a.length})
        let maxLength = alkeneChains[0].length

        alkeneChains = alkeneChains.filter(c => {return c.length == maxLength}) //longest alkene chain

        
        let LowestIndex = length

        for (const chain of alkeneChains) { //lowest alkene index
            for (const carbon of chain) {
                if (carbon.upperBond == 2 || carbon.lowerBond == 2 || carbon.leftBond == 2 || carbon.rightBond == 2) {
                    if (chain.indexOf(carbon) < LowestIndex) {
                        LowestIndex = chain.indexOf(carbon)
                        lowestAlkeneChains = [chain]
                    } else if (chain.indexOf(carbon) == LowestIndex) {
                        lowestAlkeneChains.push(chain)
                    }
                    break
                }
            }
        }

        let alkeneIndex = length
        let lowestBranchChains = lowestAlkeneChains

        for (const chain of lowestAlkeneChains) { //lowest branch index
            for (const carbon of chain) {
                let branches = carbon.neighbourScan().filter(c => {return c.name !== 'H' && !chain.includes(c)})
                if (branches.length == 0) continue
                
                if (chain.indexOf(carbon) < alkeneIndex)  {
                    lowestBranchChains = [chain]
                    alkeneIndex = chain.indexOf(carbon)
                } else if (chain.indexOf(carbon) == alkeneIndex)  {
                    lowestBranchChains.push(chain)
                }
                break
            }
        }

        let numberOfBranches = 0
        let lowestNumberChain = lowestBranchChains[0]

        for (const chain of lowestBranchChains) { //most number of branches
            let branchLength = chain.map(carbon => {return carbon.neighbourScan().filter(c => {return c.name !== 'H' && c.name !== "O" && !chain.includes(c)}).length}).reduce((partialSum, a) => partialSum + a, 0)
            if (branchLength > numberOfBranches) {
                numberOfBranches = branchLength
                lowestNumberChain = chain
            }
        }

        let name = this.alkeneName(lowestNumberChain)

        return name
    },

    alkeneName(lowestNumberChain, isAlcohol = false) {
        let doubleLines = lineArray.filter(l => {return l.bonds == 2})
        let doubleLineCarbons = doubleLines.map(l => {return l.elementScan()})
        let location = ''
        let locations = []
        let length = lowestNumberChain.length
        
        for (const carbons of doubleLineCarbons) {
            carbons.sort((a, b) => {return lowestNumberChain.indexOf(a) - lowestNumberChain.indexOf(b)})
            if (lowestNumberChain.indexOf(carbons[0]) != -1)locations.push(lowestNumberChain.indexOf(carbons[0]) + 1)
        }
            
        locations = [...new Set(locations)]
        locations.sort((a, b) => {return a - b})
        if (length > 3 || (isAlcohol && length > 2) && locations.length > 0) location = "-" + locations.join() + "-"

        let enePrefix = numericalMultiplier(locations.length)
        let branches = this.branch(lowestNumberChain)
        let prefix = carbonPrefix(length)
        
        if (locations.length > 1)  prefix += "a"

        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []        

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b) => {return a - b})
            numberBranchNames.push(numArray.join(', ')+ '-' + numericalMultiplier(numArray.length) + name)

        }

        return numberBranchNames.join('-') + prefix + location + enePrefix + 'ene'
    },

    alkyne(length, carbonChains) {
        let alkyneChains = []
        let lowestAlkyneChains = []
        let maxDB = 0
        let tripleLines = lineArray.filter(l => {return l.bonds == 3})
        let tripleLineCarbons = tripleLines.map(l => {return l.elementScan()})

        for (const chain of carbonChains) { //alkyne chains with most double bonds
            let i = 0

            for (const pairs of tripleLineCarbons) {
                if (pairs.every(c => chain.includes(c))) i++
            }

            if (i > maxDB) {
                maxDB = i
                alkyneChains = [chain]
            } else if (i == maxDB) alkyneChains.push(chain)
        }

        alkyneChains.sort((a, b) => {return b.length - a.length})
        let maxLength = alkyneChains[0].length

        alkyneChains = alkyneChains.filter(c => {return c.length == maxLength})


        let LowestIndex = length

        for (const chain of alkyneChains) {  //lowest alkyne index
            for (const carbon of chain) {
                if (carbon.upperBond == 3 || carbon.lowerBond == 3 || carbon.leftBond == 3 || carbon.rightBond == 3) {
                    if (chain.indexOf(carbon) < LowestIndex) {
                        LowestIndex = chain.indexOf(carbon)
                        lowestAlkyneChains = [chain]
                    } else if (chain.indexOf(carbon) == LowestIndex) {
                        lowestAlkyneChains.push(chain)
                    }
                    break
                }
            }
        }

        let branchIndex = length
        let lowestBranchChains = lowestAlkyneChains

        for (const chain of lowestAlkyneChains) { //lowest branch index
            for (const carbon of chain) {
                let branches = carbon.neighbourScan().filter(c => {return c.name !== 'H' && !chain.includes(c)})
                if (branches.length == 0) continue
                
                if (chain.indexOf(carbon) < branchIndex)  {
                    lowestBranchChains = [chain]
                    branchIndex = chain.indexOf(carbon)
                } else if (chain.indexOf(carbon) == branchIndex)  {
                    lowestBranchChains.push(chain)
                }
                break
            }
        }

        let numberOfBranches = 0
        let lowestNumberChain = lowestBranchChains[0]

        for (const chain of lowestBranchChains) { //most number of branches
            let branchLength = chain.map(carbon => {return carbon.neighbourScan().filter(c => {return c.name !== 'H' && c.name !== "O" && !chain.includes(c)}).length}).reduce((partialSum, a) => partialSum + a, 0)
            if (branchLength > numberOfBranches) {
                numberOfBranches = branchLength
                lowestNumberChain = chain
            }
        }

        let name = this.alkyneName(lowestNumberChain)

        return name
    },

    alkyneName(lowestNumberChain, isAlcohol = false) {
        let tripleLines = lineArray.filter(l => {return l.bonds == 3})
        let tripleLineCarbons = tripleLines.map(l => {return l.elementScan()})
        let location = ''
        let locations = []
        let length = lowestNumberChain.length
        
        for (const carbons of tripleLineCarbons) {
            carbons.sort((a, b) => {return lowestNumberChain.indexOf(a) - lowestNumberChain.indexOf(b)})
            if (lowestNumberChain.indexOf(carbons[0]) != -1) locations.push(lowestNumberChain.indexOf(carbons[0]) + 1)

        }
            
        locations = [...new Set(locations)]
        locations.sort((a, b) => {return a - b})
        if (length > 3 || (isAlcohol && length > 2) && locations.length > 0) location = "-" + locations.join() + "-"


        let enePrefix = numericalMultiplier(locations.length)
        let branches = this.branch(lowestNumberChain)
        
        let prefix = carbonPrefix(length)
        if (locations.length > 1)  prefix += "a"

        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []        

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b) => {return a - b})
            numberBranchNames.push(numArray.join(', ')+ '-' + numericalMultiplier(numArray.length) + name)
        }

        return numberBranchNames.join('-') + prefix + location + enePrefix + 'yne'
    },

    enyne() {

    },

    alcohol(length, carbonChains, oxygens) {
        let alcoholChains = []
        let hydroxylCarbons = []

        for (const oxygen of oxygens) {
            let carbon = oxygen.neighbourScan().filter(c => {return c.name == "C"})[0]
            hydroxylCarbons.push(carbon)
        }

        let maxAlcohol = 0

        for (const chain of carbonChains) { //has most hydroxyl groups
            let i = 0
            for (const carbon of chain) {
                if (hydroxylCarbons.includes(carbon)) i++
            }

            if (i > maxAlcohol) {
                maxAlcohol = i
                alcoholChains = [chain]
            } else if (i == maxAlcohol) alcoholChains.push(chain)
        }

        alcoholChains.sort((a, b) => {return b.length - a.length})
        let maxLength = alcoholChains[0].length

        alcoholChains = alcoholChains.filter(c => {return c.length == maxLength})


        let lowestHydroxylChains = []
        let LowestIndex = length

        for (const chain of alcoholChains) { //lowest hydroxyl number
            for (const carbon of chain) {
                if (!hydroxylCarbons.includes(carbon)) continue

                let index = chain.indexOf(carbon)
                
                if (index < LowestIndex)  {
                    lowestHydroxylChains = [chain]
                    LowestIndex = index
                } else if (index == LowestIndex)  {
                    lowestHydroxylChains.push(chain)
                }
                break
            }
        }

        if (lineDictionary[2] > 0 || lineDictionary[3] > 0) { //most multi bonds
            let multiLines = lineArray.filter(l => {return l.bonds > 1})
            let multiLineCarbons = multiLines.map(l => {return l.elementScan()})
            let chains = []
            let maxMB = 0
    
            for (const chain of lowestHydroxylChains) {
                let i = 0
    
                for (const pairs of multiLineCarbons) {
                    if (pairs.every(c => chain.includes(c))) i++
                }
    
                if (i > maxMB) {
                    maxMB = i
                    chains = [chain]
                } else if (i == maxMB) chains.push(chain)
            }
            lowestHydroxylChains = chains
        }

        let lowestBranchChains = lowestHydroxylChains
        let branchIndex = length

        for (const chain of lowestHydroxylChains) { //lowest branch number
            for (const carbon of chain) {
                if (!carbon.neighbourScan().some(c => {return c.name !== 'H' && c.name !== "O" && !chain.includes(c)})) continue
                
                if (chain.indexOf(carbon) < branchIndex)  {
                    lowestBranchChains = [chain]
                    branchIndex = chain.indexOf(carbon)
                } else if (chain.indexOf(carbon) == branchIndex)  {
                    lowestBranchChains.push(chain)
                }
                break
            }
        }
        
        let numberOfBranches = 0
        let lowestNumberChain = lowestBranchChains[0]

        for (const chain of lowestBranchChains) { //most number of branches
            let branchLength = chain.map(carbon => {return carbon.neighbourScan().filter(c => {return c.name !== 'H' && c.name !== "O" && !chain.includes(c)}).length}).reduce((partialSum, a) => partialSum + a, 0)
            if (branchLength > numberOfBranches) {
                numberOfBranches = branchLength
                lowestNumberChain = chain
            }
        }

        let name = this.alcoholName(lowestNumberChain)
        let locations = []
        let location = ''
        let prefix = numericalMultiplier(hydroxylCarbons.length)

        if (maxLength > 1) {
            for (const carbon of hydroxylCarbons) {
                locations.push(lowestNumberChain.indexOf(carbon) + 1)
            }
            locations.sort((a, b) => {return a - b})
            location = "-" + locations.join() + "-"
        } 
        if (hydroxylCarbons.length == 1) name = name.slice(0, -1)

        return name + location + prefix + "ol"
    },

    alcoholName(lowestNumberChain) {
        if (lineDictionary[2] > 0) {
            return this.alkeneName(lowestNumberChain, true)
        } else if (lineDictionary[3] > 0) {
            return this.alkyneName(lowestNumberChain, true)
        } else return this.alkaneName(lowestNumberChain)
    },

    carboxylicAcid(carbonChains, carboxylCarbons) {
        let carboxylicAcids = []

        if (carboxylCarbons.length == 1) {
            carboxylicAcids = carbonChains.filter(c => {return carboxylCarbons.includes(c[0])})
        } else {
            carboxylicAcids = carbonChains.filter(c => {return carboxylCarbons.includes(c[0]) && carboxylCarbons.includes(c[c.length - 1])})
        }

        let maxLength = 0
        let longestChains = []

        for (const chain of carboxylicAcids) {
            if (chain.length > maxLength) {
                longestChains = [chain]
                maxLength = chain.length
            }
            else if (chain.length == maxLength) longestChains.push(chain)
        }
    
        let lowestBranchChains = longestChains
        let branchIndex = maxLength

        for (const chain of longestChains) { //lowest branch number
            for (const carbon of chain) {
                if (!carbon.neighbourScan().some(c => {return c.name !== 'H' && c.name !== "O" && !chain.includes(c)})) continue
                
                if (chain.indexOf(carbon) < branchIndex)  {
                    lowestBranchChains = [chain]
                    branchIndex = chain.indexOf(carbon)
                } else if (chain.indexOf(carbon) == branchIndex)  {
                    lowestBranchChains.push(chain)
                }
                break
            }
        }
                
        let numberOfBranches = 0
        let lowestNumberChain = lowestBranchChains[0]

        for (const chain of lowestBranchChains) { //most number of branches
            let branchLength = chain.map(carbon => {return carbon.neighbourScan().filter(c => {return c.name !== 'H' && c.name !== "O" && !chain.includes(c)}).length}).reduce((partialSum, a) => partialSum + a, 0)
            if (branchLength > numberOfBranches) {
                numberOfBranches = branchLength
                lowestNumberChain = chain
            }
        }

        let name = this.carboxylicAcidName(lowestNumberChain)

        if (carboxylCarbons.length == 1) {
            name = name.slice(0, -1) + "oic acid"
        } else name += "dioic acid"

        return name
    },

    carboxylicAcidName(lowestNumberChain) {
        if (lineDictionary[2] > 1) {
            return this.alkeneName(lowestNumberChain, true)
        } else if (lineDictionary[3] > 0) {
            return this.alkyneName(lowestNumberChain, true)
        } else return this.alkaneName(lowestNumberChain)
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
        debugger
        let branches = []
        let number = 1

        for (const carbon of carbonChain) {
            let branchStems = carbon.neighbourScan().filter(c => {return c.name !== 'H' && c.name !== "O" && !carbonChain.includes(c) && c !== exception})

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