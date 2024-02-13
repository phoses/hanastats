import { computed } from 'vue';
import _ from 'lodash';
import moment from 'moment';
import { matchStore } from './Stats.vue';

export const matches = computed( () => {
if ( matchStore.matches === null ) {
return null;
}

return _.chain( matchStore.matches )
.map( match => {
return {
...match,
playedFormatted: moment( match.played ).format( 'YY-MM-DD' ),
homewinner: match.homeScore > match.awayScore,
awaywinner: match.awayScore > match.homeScore
};
} )
.sortBy( 'played' )
.reverse()
.value();
} );
