export let Name = {
    carboxylCarbons : [],
    carbonylCarbons : [],
    hydroxylCarbons : [],
    esterCarbons : [],
    anhydrideCarbons : [],
    esters : [],
    ethers : [],
    hydroxyls : [],
    carbonyls : [],
    anhydrides : [],
    doubleLineCarbons : [],
    tripleLineCarbons : [],

    hydrocarbon(length, carbonChains, hasMainFunctionalGroup = false, mainFunctionalGroupCarbons, exception, isBranch) {
        let lowestNumberChain = this.hydrocarbonFilter(length, carbonChains, hasMainFunctionalGroup = false, mainFunctionalGroupCarbons)

        return this.hydrocarbonName(lowestNumberChain, hasMainFunctionalGroup, exception, isBranch)
    },

    hydrocarbonFilter(length, carbonChains, hasMainFunctionalGroup = false, mainFunctionalGroupCarbons) {
        let doubleLineCarbons = []
        let tripleLineCarbons = []

        let longestChains = carbonChains.filter(c => {return c.length == length}) //longest chain
        let lowestLocantChains = longestChains
        
        if (this.doubleLineCarbons.length > 0 || this.tripleLineCarbons.length > 0) { // not alkane
            
            if (this.doubleLineCarbons.length > 0) {
                let temp = this.doubleLineCarbons

                for (const pair of temp) {
                    if (doubleLineCarbons.some(p => {return p.every(c => {return pair.includes(c)})})) continue
                    else doubleLineCarbons.push(pair)
                }
            }
            
            if (this.tripleLineCarbons.length > 0) {
                let temp = this.tripleLineCarbons

                for (const pair of temp) {
                    if (tripleLineCarbons.some(p => {return p.every(c => {return pair.includes(c)})})) continue
                    else tripleLineCarbons.push(pair)
                }
            }

            let multiLineCarbons = doubleLineCarbons.concat(tripleLineCarbons)
            let mostBondChains = longestChains

            if (longestChains.length > 2 && this.tripleLineCarbons.length > 0) {
                let maxMB = 0
                for (const chain of longestChains) { //chains with most multiple bonds
                    let i = 0
                
                    for (const pairs of multiLineCarbons) {
                        if (pairs.every(c => chain.includes(c))) i++
                    }
                
                    if (i > maxMB) {
                        maxMB = i
                        mostBondChains = [chain]
                    } else if (i == maxMB && maxMB > 0) mostBondChains.push(chain)
                }

            }

            let mostDoubleBondChains = mostBondChains

            if (mostBondChains.length > 2 && this.doubleLineCarbons.length > 0) {
                let maxDB = 0
                for (const chain of longestChains) { //chains with most double bonds
                    let i = 0
                
                    for (const pairs of doubleLineCarbons) {
                        if (pairs.every(c => chain.includes(c))) i++
                    }
                
                    if (i > maxDB) {
                        maxDB = i
                        mostDoubleBondChains = [chain]
                    } else if (i == maxDB && maxDB > 0) mostDoubleBondChains.push(chain)
                }

            }

            if (hasMainFunctionalGroup) {
                let temp = [...mostDoubleBondChains]
                let LowestIndex = length
                
                for (const chain of temp) { //lowest hydroxyl number
                    for (const carbon of chain) {
                        if (!mainFunctionalGroupCarbons.includes(carbon)) continue
        
                        let index = chain.indexOf(carbon)
                        
                        if (index < LowestIndex)  {
                            mostDoubleBondChains = [chain]
                            LowestIndex = index
                        } else if (index == LowestIndex)  {
                            mostDoubleBondChains.push(chain)
                        }
                        break
                    }
                }
            }

            let lowestMultiLocantChains = mostDoubleBondChains
            let LowestIndex = length

            if (this.tripleLineCarbons.length > 0) {
                for (const chain of mostDoubleBondChains) { //lowest multiple bond locant
                    let i = 1
                    for (const carbon of chain) {
                        if (carbon.upperBond == 1 && carbon.lowerBond == 1 && carbon.leftBond == 1 && carbon.rightBond == 1) continue
                        if (i == chain.length) break
                        let pair = [carbon, chain[i]]
                        if (multiLineCarbons.some(p => {return p.every(c => {return pair.includes(c)})})) {
                            if (i - 1 < LowestIndex) {
                                LowestIndex = i - 1
                                lowestMultiLocantChains = [chain]
                            } else if (i - 1 == LowestIndex && LowestIndex < length) {
                                lowestMultiLocantChains.push(chain)
                            }
                            break
                        }
                        i++
                    }
                }
                LowestIndex = length
            }

            let lowestDoubleLocantChains = lowestMultiLocantChains

            for (const chain of lowestMultiLocantChains) { //lowest double bond locant
                let i = 1
                for (const carbon of chain) {
                    if (i == chain.length) break
                    if (carbon.upperBond == 1 && carbon.lowerBond == 1 && carbon.leftBond == 1 && carbon.rightBond == 1) {
                        i++
                        continue
                    }
                    let pair = [carbon, chain[i]]
                    if (doubleLineCarbons.some(p => {return p.every(c => {return pair.includes(c)})})) {
                        if (i - 1 < LowestIndex) {
                            LowestIndex = i - 1
                            lowestDoubleLocantChains = [chain]
                        } else if (i - 1 == LowestIndex && LowestIndex < length) {
                            lowestDoubleLocantChains.push(chain)
                        }
                        break
                    }
                    i++
                }
            }
            
            lowestLocantChains = lowestDoubleLocantChains
        }

        if (this.doubleLineCarbons.length == 0 && this.tripleLineCarbons.length == 0 && hasMainFunctionalGroup) { 
            let temp = [...lowestLocantChains]
            let LowestIndex = length
            
            lowestLocantChains = []
            for (const chain of temp) { //lowest hydroxyl number
                for (const carbon of chain) {
                    if (!mainFunctionalGroupCarbons.includes(carbon)) continue
    
                    let index = chain.indexOf(carbon)
                    
                    if (index < LowestIndex)  {
                        lowestLocantChains = [chain]
                        LowestIndex = index
                    } else if (index == LowestIndex)  {
                        lowestLocantChains.push(chain)
                    }
                    break
                }
            }
        }

        let numberOfBranches = 0
        let mostBranchChains = lowestLocantChains

        for (const chain of lowestLocantChains) { //most number of branches
            let branchLength = chain.map(carbon => {return carbon.neighbourScan().filter(c => {return c.name !== 'H' && !chain.includes(c)}).length}).reduce((partialSum, a) => partialSum + a, 0)
            if (branchLength > numberOfBranches) {
                numberOfBranches = branchLength
                mostBranchChains = [chain]
            } else if (branchLength == numberOfBranches && numberOfBranches > 0) mostBranchChains.push(chain)
        }

        let branchIndex = length
        let lowestNumberChain = mostBranchChains[0]

        for (const chain of mostBranchChains) { //lowest branch index
            for (const carbon of chain) {
                let branches = carbon.neighbourScan().filter(c => {return c.name !== 'H' && !chain.includes(c)})
                if (branches.length == 0) continue
                
                if (chain.indexOf(carbon) < branchIndex)  {
                    lowestNumberChain = chain
                    branchIndex = chain.indexOf(carbon)
                }
                break
            }
        }

        return lowestNumberChain
    },

    hydrocarbonName(lowestNumberChain, hasMainFunctionalGroup = false, exception, isBranch) {
        let eneLocation = ''
        let yneLocation = ''
        let length = lowestNumberChain.length
        let addA = false
        if (this.doubleLineCarbons.length > 0) {
            let locations = []

            for (const pair of this.doubleLineCarbons) {
                pair.sort((a, b) => {return lowestNumberChain.indexOf(a) - lowestNumberChain.indexOf(b)})
                if (lowestNumberChain.indexOf(pair[0]) != -1) locations.push(lowestNumberChain.indexOf(pair[0]) + 1)
            }

            locations = [...new Set(locations)]

            if (locations.length > 0) {
                locations.sort((a, b) => {return a - b})
                
                if (length > 3 || (hasMainFunctionalGroup || isBranch && length > 2) && locations.length > 0) eneLocation = "-" + locations.join() + "-"
                if (locations.length > 1) addA = true
                
                let enePrefix = numericalMultiplier(locations.length)
                eneLocation += enePrefix + 'ene'
            }
        }

        if (this.tripleLineCarbons.length > 0) {
            let locations = []
    
            for (const pair of this.tripleLineCarbons) {
                pair.sort((a, b) => {return lowestNumberChain.indexOf(a) - lowestNumberChain.indexOf(b)})
                if (lowestNumberChain.indexOf(pair[0]) != -1) locations.push(lowestNumberChain.indexOf(pair[0]) + 1)
            }

            locations = [...new Set(locations)]

            if (locations.length > 0) {
                locations.sort((a, b) => {return a - b})
                
                if (length > 3 || (hasMainFunctionalGroup && length > 2) && locations.length > 0) yneLocation = "-" + locations.join() + "-"
                
                let ynePrefix = numericalMultiplier(locations.length)
                yneLocation += ynePrefix + 'yne'
            }
        }

        let branches = this.branch(lowestNumberChain, exception, isBranch)
        let prefix = carbonPrefix(length)
        
        if (addA) prefix += "a"
        if (yneLocation !== "") eneLocation = eneLocation.slice(0, -1)

        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []        

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b) => {return a - b})

            if  ((!hasMainFunctionalGroup && length <= 4 && !['chloro', 'bromo', 'iodo'].includes(name) && branches.length == 1 && !isBranch) || //one alkyl branch
                (!hasMainFunctionalGroup && length == 2 && ['chloro', 'bromo', 'iodo'].includes(name) && numArray.length == 1 && !isBranch) ||
                (length == 1 && ['chloro', 'bromo', 'iodo'].includes(name)) || //halobranch
                (isBranch && length == 1) // halo in alkyls
            ) {
                numberBranchNames.push(numericalMultiplier(numArray.length) + name) // no numbering
            } else numberBranchNames.push(numArray.join(', ')+ '-' + numericalMultiplier(numArray.length) + name) // has numbering

        }

        let main = (eneLocation == '' && yneLocation == '')? "ane" : eneLocation + yneLocation;

        return numberBranchNames.join('-') + prefix + main
    },

    alcohol(carbonChains, oxygens) {
        let alcoholChains = []
        let hydroxylCarbons = []

        for (const oxygen of oxygens) {
            let carbon = oxygen.neighbourScan().filter(c => {return c.name == "C"})[0]
            hydroxylCarbons.push(carbon)
        }

        this.hydroxylCarbons = hydroxylCarbons
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
        let lowestNumberChain = this.hydrocarbonFilter(maxLength, alcoholChains, true, hydroxylCarbons)
        let name = this.hydrocarbonName(lowestNumberChain, true)
        let prefix = numericalMultiplier(hydroxylCarbons.length)
        let locations = []
        let location = ''

        if (maxLength > 2) {
            for (const carbon of hydroxylCarbons) {
                let index = lowestNumberChain.indexOf(carbon)
                if (index != -1) locations.push(index + 1)
            }
            locations.sort((a, b) => {return a - b})
            location = "-" + locations.join() + "-"
        } 
        if (hydroxylCarbons.length == 1) name = name.slice(0, -1)

        return name + location + prefix + "ol"
    },

    carboxylicAcid(carbonChains, carboxylCarbons) {
        let carboxylicAcids = []

        if (carboxylCarbons.length == 1) {
            carboxylicAcids = carbonChains.filter(c => {return carboxylCarbons.includes(c[0])})
        } else {
            carboxylicAcids = carbonChains.filter(c => {return carboxylCarbons.includes(c[0]) && carboxylCarbons.includes(c[c.length - 1])})

        }
        carboxylicAcids.sort((a, b) => {return b.length - a.length})

        let chain = this.hydrocarbonFilter(carboxylicAcids[0].length, carboxylicAcids, true, carboxylCarbons)
        let number = 0

        if (carboxylCarbons.length > 2) {
            number = chain.map(carbon => {return carbon.neighbourScan().filter(c => {return carboxylCarbons.includes(c)}).length}).reduce((partialSum, a) => partialSum + a, 0)

            if (number > 2){
                chain.pop()
                chain.splice(0, 1)
            }
        }

        let name = this.hydrocarbonName(chain, true)
        
        if (carboxylCarbons.length == 1) name = name.slice(0, -1) + "oic acid"
        else if (carboxylCarbons.length == 2 || number == 2) name = name.slice(0, -1) + "dioic acid"
        else {
            let prefix = numericalMultiplier(number)
            name += prefix + "carboxylic acid"
        }

        return name
    },

    ester() {
        if (this.esters.length == 1) {
            let carboxylicSide = this.esters[0].neighbourScan().filter(c => {return this.carbonylCarbons.includes(c)})[0]
            let alcoholSide = this.esters[0].neighbourScan().filter(c => {return !this.carbonylCarbons.includes(c)})[0]

            let carbonChains = carbonTrace(carboxylicSide, this.esters[0])
            let carboxylicName = this.hydrocarbon(carbonChains[0].length, carbonChains, false, [], this.esters[0], true)

            carboxylicName = carboxylicName.slice(0, -1) + "oate"

            let branchName = this.carbonBranch(alcoholSide, this.esters[0]).slice(1, -1)

            return branchName + " " + carboxylicName 
        }
    },

    anhydride() {
        let names = []
        if (this.anhydrides.length == 1) {
            for (const carbon of this.anhydrides[0].neighbourScan()) {
                let carbonChains = carbonTrace(carbon, this.anhydrides[0])
                let carboxylicName = this.hydrocarbon(carbonChains[0].length, carbonChains, false, [], this.anhydrides[0], true)
    
                carboxylicName = carboxylicName.slice(0, -1) + "oic"
                names.push(carboxylicName)
            }
            
            names = [...new Set(names)].sort()
            return names.join(" ") + " anhydride"
        }
    },

    carbonBranch(startingElement, mainElement) {
        
        let carbonChains = carbonTrace(startingElement, mainElement)

        if (this.carboxylCarbons.length > 2) {
            for (const chain of carbonChains) {
                if (this.carboxylCarbons.includes(chain[chain.length - 1])) chain.pop()
            }
        }

        let carbonChain = this.hydrocarbonFilter(carbonChains[0].length, carbonChains, false, [])
        let name = this.hydrocarbonName(carbonChain, false, mainElement, true)

        let needsBracket = carbonChain.some(carbon => {return carbon.neighbourScan().some(c => {return c.name !== 'H' && !carbonChain.includes(c) && c !== mainElement})})

        if (name[name.length - 3] == 'a') name = name.slice(0, -3) + 'yl'
        else name = name.slice(0, -1) + 'yl'

        if (this.doubleLineCarbons.some(pair => {return pair.includes(startingElement) && pair.includes(mainElement)})) {
            name += "idene"
        }


        return (needsBracket)? '(' + name + ')': name
    },

    branch(carbonChain, exception, isBranch = false) {
        let branches = []
        let number = 1

        for (const carbon of carbonChain) {
            let branchStems = carbon.neighbourScan().filter(c => {return c.name !== 'H' && !carbonChain.includes(c) && c !== exception})

            if (branchStems.length > 0) {
                for (const branchStem of branchStems) {
                    switch (branchStem.name) {
                        case 'C':
                            if (this.carboxylCarbons.includes(branchStem)) {
                                if (isBranch) branches.push(['carboxy', number])
                                break
                            }

                            let name = Name.carbonBranch(branchStem, carbon)
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
                        case 'O':
                            if (!this.carboxylCarbons.includes(carbon) && !this.esterCarbons.includes(carbon) && !this.anhydrideCarbons.includes(carbon)){
                                if (this.hydroxyls.includes(branchStem) && (this.carboxylCarbons.length > 0 || this.esters.length > 0 || isBranch))branches.push(['hydroxy', number])
                                else if (this.carbonyls.includes(branchStem)) branches.push(["oxo", number])
                                else if (this.ethers.includes(branchStem)) {
                                    let name = this.oxy(branchStem, carbon)
                                    branches.push([name, number])
                                }
                            }
                            break;
                    }
                }
            }
            number++
        }
        return branches
    },

    oxy(oxygen, exception) {
        let startingElement = oxygen.neighbourScan().filter(c => {return c !== exception})[0]
        let name = this.carbonBranch(startingElement, oxygen)
        name = name.slice(0, -1)

        if (name[name.length - 3] !== 'a') name = name.slice(0, -1) + "oxy"
        else name = name.slice(0, -3) + "oxy"

        return name
    }

}

function carbonTrace(startingElement, mainElement) {
    let tracedElement = startingElement.carbonTrace(mainElement)
    let carbonChains = []

    if (tracedElement.length > 1) {
        for (const b of tracedElement) {
            carbonChains.push([startingElement].concat(...b))
        }
        carbonChains.sort((a, b) => {return b.length - a.length})
    } else carbonChains.push([startingElement].concat(...tracedElement))

    return carbonChains
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