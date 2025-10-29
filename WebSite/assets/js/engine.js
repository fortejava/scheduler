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
                    console.log(res);
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

                //TODO: estrarre l'elenco delle fatture del mese/anno attuale
                const invoicesList = invoicesSearch(today.getMonth(), today.getFullYear());

                calendarHandler(today.getMonth(), today.getFullYear(), invoicesList);

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
    const retvalue = [
        {
            status: "pagata",
            customer: "pippo",
            amount: 100,
            dueDate: "2025-10-28",
            invoiceId: "1",
            invoiceCode: "1 / 2025"
        },
        {
            status: "da pagare",
            customer: "pluto",
            amount: 100,
            dueDate: "2025-10-29",
            invoiceId: "2",
            invoiceCode: "2 / 2025"
        },
        {
            status: "pagata",
            customer: "pippo",
            amount: 100,
            dueDate: "2025-11-03",
            invoiceId: "1",
            invoiceCode: "3 / 2025"
        },
        {
            status: "da pagare",
            customer: "pluto",
            amount: 100,
            dueDate: "2025-11-04",
            invoiceId: "2",
            invoiceCode: "4 / 2025"
        }
    ];

    return retvalue;
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
    let fd = new FormData();

    const frontendForm = document.forms["createInvoice"];

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
                            showPopup("Fattura creata correttamente!","complimenti, sei un eroe!!!");
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

    event.preventDefault();
    event.stopPropagation();
    return false;

}

const showPopup = (title, message) => {
    document.getElementById("popup-label").innerText = title;
    document.getElementById("popup-content").innerText = message;
    const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    myModal.show();
}
/*
//Autologin
window.onload = function () {

    if (localStorage.getItem("username") != null && localStorage.getItem("token") != null)
    {
        doLogin(localStorage.getItem("username"), localStorage.getItem("token"));
    }
    
}
*/

