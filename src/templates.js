const e = String.fromCodePoint
const emoji = {
    'city': e(127984),
    'earth': e(127758),
    'heart': e(9829),
    'lol': e(128516),
    'righthand': e(128073),
    'train': e(128645)
}

function genText(templateFn, settings, tripData){
    if (!tripData.hasOwnProperty("alternatives")){
        return '';
    }
    let air_trip = tripData.alternatives.find(a => (a.type === 'air'))
    let rail_trip = tripData.alternatives.find(a => (a.type === 'rail'))

    let air_km = air_trip.total_distance_km.toFixed(1);
    let rail_km = (rail_trip.total_distance_km * 1.3).toFixed(1);

    let air_co2_kg = (air_km * 0.15).toFixed(1);
    let rail_co2_kg = (rail_km * 0.01).toFixed(1);

    let rail_duration_h = (rail_trip.total_duration_s / 3600).toFixed(1);

    let train_legs_upper = rail_trip.legs.slice(0,-1).map(l => l.end.name)
    let train_legs = train_legs_upper.map(x => x.charAt(0) + x.substring(1).toLowerCase())

    return templateFn(settings, {
        'air_km': air_km,
        'air_co2': air_co2_kg,
        'rail_km': rail_km,
        'rail_co2': rail_co2_kg,
        'rail_duration_h': rail_duration_h,
        'train_legs': train_legs
    })
}

function default_template(settings, data){
    const tpl = 

`
"A ${data.rail_km} km train ride to go from ${settings.cityA} to ${settings.cityB}? why would you infict yourself this?" is a typical reaction when I hint at my recent travel. If I had taken the plane, I would have traveled ${data.air_km} km and burnt ${data.air_co2} kg into the atmosphere.
Instead, I decided to take the train and traveled ${data.rail_km} km only emitting ${data.rail_co2} kg in the thin layer protecting our dear precious Earth. 
Why fly over all these great european cities instead of exploring them between train legs? 
` 

+ (data.train_legs.length > 1 ? 
    `

Not only I participated to saving the planet, but I got to visit amazing places such as \n\n\t${emoji.righthand} ${data.train_legs.join('\n\n\t' + emoji.righthand + ' ')}`
    : '')
+  

`

My travel in a few simple numbers:
- ${data.rail_co2} km traveled
- ${data.train_legs.length + 1} train ride(s)
- ${data.air_co2 - data.rail_co2} kg CO2 saved.


${emoji.righthand} Believe me, it's not that easy to resist to a week-end in Barcelona by air but it is not that hard to travel virtuously either.
${emoji.righthand} Get out of your comfort bubble and take the right decision for the planet.

`

    return tpl
}

function friends_template(settings, data){
    const tpl = 

`
Here I am, by myself at 6 am starting my ${data.rail_duration_h} hours train ride from ${settings.cityA} to ${settings.cityB} while my friends are together for a short plane ride. I'm not going to lie to you, the hardest part was to face the social pressure. "Come on, just one short flight, no one will know and it won't hurt anyone." Not so long ago I could have said those words until I realized what is really at stake for our planet. Since I stopped flying, I rediscovered why travelling really is about: seeing the landscapes change slowly around you and relish every new scenery during a long journey. Slow down, in my head - as well. In this trip I also got to discover magnificent places that my friends disdainfully flew over.` 

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
