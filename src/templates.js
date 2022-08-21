const emojis = {
    'lol': String.fromCodePoint(128516),
    'righthand': String.fromCodePoint(128073)
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

    let train_legs = rail_trip.legs.slice(0,-1).map(l => l.end.name)

    return templateFn(settings, {
        'air_km': air_km,
        'air_co2': air_co2_kg,
        'rail_km': rail_km,
        'rail_co2': rail_co2_kg,
        'train_legs': train_legs
    })
}

function default_template(settings, data){
    const tpl = 

`

I'm a virtuous traveler from ${settings.cityA} to ${settings.cityB}. If I had taken the plane, like any other egoistic human being, I would have traveled
${data.air_km} km and burnt ${data.air_co2} kg into the atmosphere. Instead, I decided to take the train and traveled ${data.rail_km} km only emitting ${data.rail_co2} kg.
in the thin layer protecting our dear precious Earth.` 

+ (data.train_legs.length > 1 ? 
    `

Not only I participated to saving the planet, but I got to visit amazing places such as \n\n\t${emojis.righthand} ${data.train_legs.join('\n\n\t' + emojis.righthand + ' ')}`
    : '')
+  

`

${emojis.righthand} It is not that hard to travel virtuously.
${emojis.righthand} Get out of your comfort bubble and take the right decision for the planet.
${emojis.righthand} Burgaud should be ashame of working at AA.

`

    return tpl
}

const templates = {
    'default': default_template
}

export {
    templates,
    genText
};
