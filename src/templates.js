const e = String.fromCodePoint
const emoji = {
    'city': e(127984),
    'earth': e(127758),
    'heart': e(9829),
    'lol': e(128516),
    'righthand': e(128073),
    'train': e(128645)
}

function boldenNumbers(number) {
      return number.replace(/\d/g, (c) => String.fromCodePoint(0x1D79E + c.charCodeAt(0)));
}

function bolden(text){
    function translate (char){
        let diff;
        if (/[A-Z]/.test (char)){
            diff = "𝗔".codePointAt (0) - "A".codePointAt (0);
        }
        else {
            diff = "𝗮".codePointAt (0) - "a".codePointAt (0);
        }
        return String.fromCodePoint (char.codePointAt (0) + diff);
    }
    let newText = text.replace (/[A-Za-z]/g, translate);
    return boldenNumbers(newText);
}

function genText(templateFn, settings, tripData){
    if (!tripData.hasOwnProperty("alternatives")){
        return '';
    }
    let air_trip = tripData.alternatives.find(a => (a.type === 'air'))
    let rail_trip = tripData.alternatives.find(a => (a.type === 'rail'))

    let air_km = air_trip.total_distance_km;
    let rail_km = (rail_trip.total_distance_km * 1.3);

    let air_co2_kg = (air_km * 0.15) * settings.bias;
    let rail_co2_kg = (rail_km * 0.01);

    let rail_duration_h = (rail_trip.total_duration_s / 3600);

    let train_legs_upper = rail_trip.legs.slice(0,-1).map(l => l.end.name)
    let train_legs = train_legs_upper.map(x => x.charAt(0) + x.substring(1).toLowerCase())

    let travel_time = settings.travelDays * 15 // 15 useful hours per day
    let rail_travel_time = ((rail_duration_h) + (rail_trip.legs.length - 1) * 2) // 90 min of connection time
    let useful_time_h = Math.max(0, travel_time - rail_travel_time)

    return templateFn(settings, {
        'air_km': air_km.toFixed(0),
        'air_co2': air_co2_kg.toFixed(1),
        'co2_saved_kg': (air_co2_kg - rail_co2_kg).toFixed(1),
        'rail_km': rail_km.toFixed(0),
        'rail_co2': rail_co2_kg.toFixed(1),
        'rail_duration_h': rail_duration_h.toFixed(1),
        'train_legs': train_legs,
        'total_rail_time_h': rail_travel_time.toFixed(0),
        'useful_time_h': useful_time_h.toFixed(0)
    })
}

function default_template(settings, data){
    const tpl = 

`
"A ${bolden(data.rail_km + 'km')} and ${bolden(data.total_rail_time_h + 'h')} train ride to go from ${bolden(settings.cityA)} to ${bolden(settings.cityB)}? why would you infict this to youself?" is a typical reaction when I hint at my recent travel. Had I taken the plane, I would have traveled ${data.air_km} km and burnt ${data.air_co2} kg of CO2 into the atmosphere.
Instead, I decided to take the train and traveled ${data.rail_km} km only emitting ${data.rail_co2} kg of carbon dioxide in the thin layer protecting our dear precious Earth. 
Why fly over all these great european cities instead of exploring them between train legs? 
` 

+ (data.train_legs.length > 1 ? 
    `

Not only I participated to saving the ${emoji.earth} planet ${emoji.earth}, but I got to visit amazing places such as \n\n\t${emoji.righthand} ${data.train_legs.join('\n\n\t' + emoji.righthand + ' ')}`
    : '')
+  

`

My travel in a few simple numbers:

${emoji.train} ${data.rail_km} km traveled
${emoji.train} ${data.train_legs.length + 1} train ride(s)
${emoji.earth} ${data.co2_saved_kg} kg CO2 saved.

${emoji.righthand} Despite spending ${data.total_rail_time_h} h in the train, I still managed to spend ${bolden(data.useful_time_h + ' hours')} of daytime in ${settings.cityB} ${emoji.heart}.
${emoji.righthand} Believe me, it's not that easy to resist to a week-end in ${settings.cityB} by air but it is not that hard to travel virtuously either.
${emoji.earth} Get out of your comfort bubble and take the right decision for the planet.

`

    return tpl
}

function friends_template(settings, data){
    const tpl = 

`
Here I am, by myself at 6 am starting my ${bolden(data.total_rail_time_h + ' hours')} train journey from ${bolden(settings.cityA + ' to ' + settings.cityB)} while my friends are together for a short plane ride. I'm not going to lie to you, the hardest part was to face the social pressure. "Come on, just one short flight, no one will know and it won't hurt anyone." Not so long ago I could have said those words until I realized what is really at stake for our planet ${emoji.earth}. Since I stopped flying, I rediscovered what travelling really is about: seeing diverse landscapes slowly change around you and relish every new scenery during a long journey. Slow down, in my head as well. In this trip I also got to discover magnificent places that my friends disdainfully flew over.` 

+ (data.train_legs.length > 1 ? 
    `

Such as \n\n\t${emoji.heart} ${data.train_legs.join('\n\n\t' + emoji.heart + ' ')}`
    : '')
+  

`

But in the end, I don't care what others do, what I know is that I'm in peace with the data that is available to me:

${emoji.train} ${data.rail_km} km traveled

${emoji.city} ${data.train_legs.length + 1} citie(s) explored.

${emoji.earth} ${data.air_co2 - data.rail_co2} kg CO2 saved.

`

    return tpl
}

const templates = {
    'default': default_template,
    'friends': friends_template
}

export {
    templates,
    genText
};
