
const DateFormat = ({date}:{date:any}) => {
    const dateToday = Date.parse(date)
    const dateFinal = new Date(dateToday).toDateString()
    const dateTime = new Date(dateToday).toTimeString().split(" ")[0]

    return (
        <>
            <p>{dateFinal} {dateTime}</p>
        </>
    );
};

export default DateFormat;