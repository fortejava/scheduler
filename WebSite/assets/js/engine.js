/**
 * Metodo che gestisce la login dell'utente
 */
function doLogin(sessionUsername, sessionToken)
{
    //TODO: Gestire il login

    //Creiamo l'oggetto form che invierà i dati effettivamente al server
    const dataContainer = new FormData();

    if (sessionUsername == undefined && sessionToken == undefined) {
        //Popoliamo la form
        dataContainer.append("username", document.forms.loginForm.username.value);
        dataContainer.append("password", document.forms.loginForm.password.value);
        dataContainer.append("token", "");
    }
    else
    {
        dataContainer.append("username", sessionUsername);     
        dataContainer.append("token", sessionToken);
    }

    //Creiamo l'oggetto XMLHttpRequest che invii i dati al server
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            switch (this.status)
            {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);
                    //Seconda fase: modificare aspetto GUI
                    //console.log(res);
                    loginWorker(res);
                break;

                default:
                    console.log("Si è verificato un errore, riprova più tardi");
                break;

                
            }
        }
    }

    xhr.open("POST", "/services/Login.ashx", true);
    xhr.send(dataContainer);

    event.preventDefault();
    event.stopPropagation();
}

/**
 * Funzione che elabora la risposta del server alla richiesta di login
 * @param {any} res
 */
function loginWorker(res)
{
    switch (res.Code)
    {
        case "Ok":
        {
                //Nome utente e password sono corretti, per cui dobbiamo:
                //1: inserire username e password in localStorage

                localStorage.setItem("username", document.forms.loginForm.username.value);
                localStorage.setItem("token", res.Message.Token);

                //2: Mostare la vista calendario
                showView("calendar-view");
                //2b: Inizializzare il calendario
                

                //Estraiamo anno e mese corrente
                const today = new Date();

                console.log(today.getMonth() + " " + today.getFullYear());

                //TODO: estrarre l'elenco delle fatture del mese/anno attuale
                //const invoicesList = invoicesSearch(today.getMonth(), today.getFullYear());

                invoicesSearch(today.getMonth(), today.getFullYear());


                

                //3: mostrare tutte le voci di menu nascoste e nascondere il login
                showMenu();

        } break;

        case "Ko":
        {
        } break;
    }
}

/**
 * Funzione che nasconde tutti gli elementi di classe view, tranne l'elemento con id = idToShow
 * 
 * @param {any} viewtoShow l'id della vista da mostrare
 */
function showView(viewToShow)
{
    //Cicliamo su tutte le viste
    const viewsList = document.querySelectorAll(".view");

    for (el of viewsList)
    {
        el.classList.add("view-hidden");
        el.classList.remove("view-visible");
    }

    const visibleElement = document.querySelector(`#${viewToShow}`);
    visibleElement.classList.remove("view-hidden");
    visibleElement.classList.add("view-visible");

    

}

function showMenu()
{
    /* 
    Rimuoviamo la classe guest-hidden dalle voci di menu e nascondiamo la login (se necessario)
    */
    const menuItems = document.querySelectorAll(".guest-hidden");

    for (el of menuItems)
    {
        el.classList.remove("guest-hidden");
    }

    //Nascondiamo la voce di login
    const element = document.querySelector("#nav-login");
    element.style.display = "none"
}
const invoicesSearch = (month, year) => {
    event.preventDefault();
    event.stopPropagation();
    //Estraiamo tutte le fatture del mese e dell'anno corrente
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("Year", year);
    //fd.append("Month", month+1);

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    {
                        //Prima fase: convertire il JSON in un oggetto Javascript
                        const res = JSON.parse(this.responseText);
                        let today = new Date();
                        calendarHandler(today.getMonth(), today.getFullYear(),[]);
                        //console.log(`${year} - ${month}`);
                        reloadCalendar(res);
                        //Carichiamo il calendario
                        //console.log(res);
                        //loginWorker(res);
                    }break;

                default:
                    {
                       // const res = JSON.parse(this.responseText);
                        console.log(this.responseText);
                        console.log("Si è verificato un errore, riprova più tardi");
                    }break;


            }
        }
    }

    xhr.open("POST", "/Services/InvoiceHandlers/GetInvoices.ashx", true);
    xhr.send(fd);

    retvalue = [];

   

    return retvalue;
}

/**
 * funzione che ricarica gli eventi del calendario
 */
const reloadCalendar = (events) => {
    //Costruiamo la lista dei nuovi eventi in calendare
    newEventsList = Array();

    const statusesArray = [
        {
            backgroundColor: "green",
            textColor: "white"
        },
        {
            backgroundColor: "yellow",
            textColor: "black"
        },
        {
            backgroundColor: "red",
            textColor: "white"
        }
    ];

    //Cicliamo sulle fatture per aggiungerle al calendario
    for (el of events.Message)
    {

        newEventsList.push(
            {
                
                title: el.Invoice.Customer.CustomerName + " - " + el.Invoice.InvoiceDue,
                start: el.Invoice.InvoiceDueDate.split("T")[0],
                backgroundColor: statusesArray[parseInt(el.StatusCode)].backgroundColor,
                textColor: statusesArray[parseInt(el.StatusCode)].textColor,
                borderColor: "transparent"
            }
        );
    }

    //Azzeriamo l'elenco precedente degli eventi
    calendar.removeAllEvents();
    calendar.addEventSource(newEventsList);
    // oppure
    //calendar.refetchEvents(); // se usi una funzione come source

}

const showCreateInvoice = () => {
    showView('invoice-creation');
    getAllStatuses("StatusID");
    getAllCustomers("CustomerID");

}

const getAllCustomers = (idToFill) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);

                    //TODO: Gestire il caso di KO

                    //Seconda fase: modificare aspetto GUI

                    //accedere alla select con ID passato e valorizzarla
                    fillCustomers(res, idToFill);

                    break;

                default:
                    console.log("Si è verificato un errore in fase di ottenimento dei clienti");
                    break;


            }
        }
    }
    xhr.open("GET", "/services/CustomerHandlers/GetAllCustomers.ashx", true);
    xhr.send();
}

const getAllStatuses = (idToFill) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);
                    //Seconda fase: modificare aspetto GUI

                    //TODO: Gestire il caso di KO

                    //accedere alla select con ID passato e valorizzarla
                    fillStatuses(res, idToFill);

                    break;

                default:
                    console.log("Si è verificato un errore in fase di ottenimento degli stati");
                    break;


            }
        }
    }
    xhr.open("GET", "/services/StatusHandlers/GetAllStatuses.ashx", true);
    xhr.send();
}

/**
 * Funzione che riempie la select contenente gli status con id selezionato
 */
const fillStatuses = (res, idToFill) => {
    //Otteniamo il riferimento DOM alla select idToFill
    const statuses = document.getElementById(idToFill);

    for (el of res.Message)
    {
        const newOption = document.createElement("option");
        newOption.value = el.StatusID;
        newOption.innerText = el.StatusLabel;

        if (el.StatusID == 2)
        {
            newOption.selected = true;
        }

        statuses.appendChild(newOption);
    }
}

/**
 * Funzione che riempie la select contenente gli status con id selezionato
 */
const fillCustomers = (res, idToFill) => {
    //Otteniamo il riferimento DOM alla select idToFill
    const statuses = document.getElementById(idToFill);

    for (el of res.Message) {
        const newOption = document.createElement("option");
        newOption.value = el.CustomerID;
        newOption.innerText = el.CustomerName;

        if (el.StatusID == 2) {
            newOption.selected = true;
        }

        statuses.appendChild(newOption);
    }
}

/**
 * Funzione che tenta la creazione della nuova fattura
 */

function createInvoiceFunction() {

    event.preventDefault();
    event.stopPropagation();

    //Verifichiamo che il netto a pagare non sia maggiore del totale della fattura
    if (parseFloat(document.querySelector("#InvoiceDue").value) > parseFloat(document.querySelector("#InvoiceTotal").value))
    {
        //Mostriamo la popup con l'errore
        showPopup("Errore di compilazione", "Il netto a pagare non può essere maggiore del totale della fattura.");
        return false;
    }

    let fd = new FormData();
    const frontendForm = document.forms["createInvoice"];

    if (frontendForm.CreationDate.value > frontendForm.DueDate.value)
    {
        showPopup("Errore di compilazione", "La data di emissione della fattura non può essere successiva alla data di scadenza.");
        return false;
    }

    console.log(parseFloat(frontendForm.InvoiceTax.value) / 100);

    //fd.append("InvoiceID", document.forms["createInvoice"].InvoiceID.value);
    fd.append("InvoiceID", null);
    fd.append("InvoiceOrderNumber", frontendForm.InvoiceOrderNumber.value);
    fd.append("InvoiceNumber", frontendForm.InvoiceNumber.value);
    fd.append("CustomerID", frontendForm.CustomerID.value);
    fd.append("StatusID", frontendForm.StatusID.value);
    fd.append("InvoiceTaxable", frontendForm.InvoiceTaxable.value);
    fd.append("InvoiceTax", frontendForm.InvoiceTax.value);
    fd.append("InvoiceDue", frontendForm.InvoiceDue.value);
    fd.append("CreationDate", frontendForm.CreationDate.value);
    fd.append("DueDate", frontendForm.DueDate.value);
    fd.append("Description", frontendForm.Description.value);

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function ()
    {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //Prima fase: convertire il JSON in un oggetto Javascript
                    const res = JSON.parse(this.responseText);
                    console.log(res);

                    switch (res.Code)
                    {
                        case "Ok":
                            showPopup("Fattura creata correttamente!", "complimenti, sei un eroe!!!");
                            //Mostriamo la vista calendario
                            showView("calendar-view");
                            break;
                        default:
                            showPopup("Si è verificato un errore", res.Message);
                            break;
                    }

                    //Seconda fase: mostrare messaggio di errore o conferma di inserimento

                    break;

                default:
                    console.log("Si è verificato un errore in fase di inserimento della fattura");
                    break;


            }
        }
    }

    xhr.open("POST", "/services/InvoiceHandlers/CreateOrUpdateInvoice.ashx", true);
    xhr.send(fd);

    
    return false;

}

const showPopup = (title, message) => {
    document.getElementById("popup-label").innerText = title;
    document.getElementById("popup-content").innerText = message;
    const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    myModal.show();
}

/**
 * Funzione che aggiorna il totale fattura e il totale tasse
 */
const updateInvoiceCreation = () => {
    let taxableAmount = parseFloat(document.querySelector("#InvoiceTaxable").value);
    let taxRate = parseFloat(document.querySelector("#InvoiceTax").value) / 100;

    //cole.log(`${taxableAmount} - ${taxRate}`);
    if (!isNaN(taxableAmount) && !isNaN(taxRate))
    {
        //Aggiorniamo la form
        document.querySelector("#TaxTotal").value = taxableAmount * taxRate;
        document.querySelector("#InvoiceTotal").value = taxableAmount + (taxableAmount * taxRate);

    }
}

const addCustomer = () => {
    event.preventDefault();
    event.stopPropagation();

    //TODO: aggiungere il codice per l'aggiunta del cliente

    return false;
}

//Autologin
window.onload = function ()
{

    if (localStorage.getItem("username") != null && localStorage.getItem("token") != null)
    {
        doLogin(localStorage.getItem("username"), localStorage.getItem("token"));
    }
    
}


