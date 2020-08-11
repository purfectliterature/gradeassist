const FLAG_ONE_DAY_BADGE_APPROVED = "FODBAPPV"
const FLAG_PLAGIARISM = "FPLAG"
const FLAG_OVERRIDE_MULTIPLIER = "FOVMULT"

const overrideMultiplierRegExp = new RegExp(FLAG_OVERRIDE_MULTIPLIER + "\\d{1,2}")

const getDateFromString = (string) => {
    const params = /(\d{2}) (\w{3}) (\d{4}), (\d{1,2}):(\d{2})(\w{2})/
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const [_, day, month, year, hours, minutes, ampm] = params.exec(string)
    return new Date(year, months.indexOf(month), day, ampm === "pm" ? parseInt(hours) + 12 : hours, minutes)
}

const toast = (status, multiplier, headText, message = "") => `
    <div class="gras-toast gras-${status}">
        <h1>This submission ${status === "graded" ? "was" : "is"} ${headText}.</h1>
        <p>${message !== "" ? message : `<strong>${multiplier*100}%</strong> multiplier applied.`}</p>
    </div>
`

let applied = false

const observerCallback = (mutations, observer) => mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return

    mutation.addedNodes.forEach((node) => {
        const stats = document.querySelector("#course-assessment-submission > div:nth-child(3) > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(2) > table > tbody")

        if (!applied && stats) {
            const studentName = stats.querySelector("tr:nth-child(1) > td").innerText
            const status = stats.querySelector("tr:nth-child(2) > td").innerText
            const due = stats.querySelector("tr:nth-child(5) > td").innerText
            const submitted = stats.querySelector("tr:nth-child(7) > td").innerText
            
            const multiplierInput = stats.querySelector("tr:nth-child(4) > td > div > div:nth-child(2) > input")

            const dueDate = getDateFromString(due)
            const submittedDate = getDateFromString(submitted)
            
            const difference = ((submittedDate - dueDate) / 1000) / 3600

            console.log(difference)
            
            let multiplier
            let headText
            let toastStatus
            let toastMessage = ""

            if (difference > 24) {
                multiplier = 0.8
                toastStatus = "late"
                headText = "very late"
            } else if (difference > (1/6) && difference <= 24) {
                multiplier = 0.9
                toastStatus = "moderate"
                headText = "late"
            } else {
                multiplier = 1
                toastStatus = "ontime"
                headText = "on-time"
            }

            if (status === "Graded") toastStatus = "graded"

            const comments = document.querySelectorAll("div[id^=post]")
            if (comments.length > 1) {
                comments.forEach((comment) => {
                    const author = comment.querySelector("div > div:nth-child(1) > div:nth-child(1) > div > span:nth-child(1)").innerText
                    if (author.toLowerCase() !== studentName.toLowerCase()) {
                        const message = comment.innerText
                        if (message.includes(FLAG_ONE_DAY_BADGE_APPROVED)) {
                            multiplier = 1
                            toastStatus = "oneday"
                            toastMessage = "One-day badge applied."
                        }

                        if (message.includes(FLAG_PLAGIARISM)) { 
                            multiplier = 0.5
                            toastStatus = "plagiarised"
                            headText = "plagiarised"
                            toastMessage = ""
                        }

                        if (message.includes(FLAG_OVERRIDE_MULTIPLIER)) {
                            const overridenMultiplier = overrideMultiplierRegExp.exec(message)[0].split(FLAG_OVERRIDE_MULTIPLIER)[1] / 10
                            if (overridenMultiplier >= 0 && overridenMultiplier <= 1) {
                                multiplier = overridenMultiplier
                                toastStatus = toastStatus === "plagiarised" ? "plagiarised" : "overriden"
                                toastMessage = ""
                            }
                        }
                    }
                })
            }

            multiplierInput.value = multiplier

            document.getElementsByClassName("navbar-header")[0].innerHTML += toast(toastStatus, multiplier, headText, toastMessage)
            
            applied = true
            observer.disconnect()
        }
    })
})

const observer = new MutationObserver(observerCallback)
observer.observe(document.body, { subtree: true, childList: true })
