var calendar; //Definiamo il calendario come variabile globale

const calendarHandler = (month, year, invoicesList) => {
    //document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    eventsList = Array();

    //inseriamo le fatture negli eventi
    /*
    for (el of invoicesList)
    {
        eventsList.push(
            {
                title: el.invoiceCode + " - " + el.customer,
                start: el.dueDate
            }
        );
    }
    */
        calendar = new FullCalendar.Calendar(calendarEl, {
            headerToolbar: {
                left: 'prevYear,prev,next,nextYear today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay'
            },
            initialDate: new Date().getFullYear() + '-10-01',
            navLinks: true, // can click day/week names to navigate views
            editable: true,
            dayMaxEvents: true, // allow "more" link when too many events

            // Event clicking on Invoice!!!
            eventClick: function (info) {
                const invoiceId = info.event.extendedProps.invoiceId;
                if (invoiceId) {
                    showInvoiceDetail(invoiceId);
                }
            }, 

            datesSet: function (newDate) {
                
                const month = calendar.getDate().getMonth() + 1;
                const year = calendar.getDate().getFullYear();
                

            },
            events: eventsList,
            /*
            events: [
                {
                    title: 'All Day Event',
                    start: '2023-01-01',
                    backgroundColor: 'red'
                },
                {
                    title: 'Long Event',
                    start: '2023-01-07',
                    end: '2023-01-10'
                },
                {
                    groupId: 999,
                    title: 'Repeating Event',
                    start: '2023-01-09T16:00:00'
                },
                {
                    groupId: 999,
                    title: 'Repeating Event',
                    start: '2023-01-16T16:00:00'
                },
                {
                    title: 'Conference',
                    start: '2023-01-11',
                    end: '2023-01-13'
                },
                {
                    title: 'Meeting',
                    start: '2023-01-12T10:30:00',
                    end: '2023-01-12T12:30:00',
                    backgroundColor: 'red'
                },
                {
                    title: 'Lunch',
                    start: '2023-01-12T12:00:00'
                },
                {
                    title: 'Meeting',
                    start: '2023-01-12T14:30:00'
                },
                {
                    title: 'Happy Hour',
                    start: '2023-01-12T17:30:00'
                },
                {
                    title: 'Dinner',
                    start: '2023-01-12T20:00:00'
                },
                {
                    title: 'Birthday Party',
                    start: '2023-01-13T07:00:00'
                },
                {
                    title: 'Click for Google',
                    url: 'http://google.com/',
                    start: '2023-01-28'
                }
            ]
            */
        });

        calendar.render();
    //});
};
