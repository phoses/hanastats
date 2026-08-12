import { computed, type Ref } from 'vue';
import _ from 'lodash';
import type { Game } from '@/stores/game';
import type { Match } from '@/stores/match';
import type { Player } from '@/stores/player';

export interface StandingRow {
  player: string;
  /** Truthy when a single player owns the single selected game. */
  ownsGame: boolean | string | undefined;
  wins: number;
  regularTimeWins: number;
  pointsForRegularTimeWins: number;
  losses: number;
  regularTimeLosses: number;
  draws: number;
  pointsForDraws: number;
  matches: number;
  overtimelosses: number;
  pointsForOverTimeLose: number;
  overtimewins: number;
  pointsForOverTimeWin: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  playerPointsOfPercantage: string;
  maximumPoints: number;
  validResult: boolean;
  loseOrWinStreakLatestStreak: number;
  loseOrWinStreakLatestStreakType: string;
  elo: number;
}

export interface StandingsContext {
  filteredMatches: Ref<Match[] | null>;
  filteredGames: Ref<Game[]>;
  /** One entry per player (or per team when grouping by whole teams). */
  players: Ref<Player[][]>;
  allPlayers: Ref<Player[]>;
  standingsAsWholeTeam: Ref<boolean>;
  eloRatings: Ref<{ [key: string]: number }>;
}

const percentageFormat = new Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 1,
  minimumFractionDigits: 3
});

export function useStandings(context: StandingsContext) {
  const {
    filteredMatches,
    filteredGames,
    players,
    allPlayers,
    standingsAsWholeTeam,
    eloRatings,
  } = context;

  const showDraws = computed(() => {
    // Show draws column when a single game is selected and it has points for draw
    if (filteredGames.value.length === 1) {
      const selectedGame = filteredGames.value[0];
      return Boolean(selectedGame && selectedGame.pointsForDraw && selectedGame.pointsForDraw > 0);
    }
    return false;
  });

  const uniqueTeams = computed(() => {
    return _.uniqBy([
      ..._.map(filteredMatches.value, match => match.homePlayers),
      ..._.map(filteredMatches.value, match => match.awayPlayers)
    ], teamPlayers => teamPlayers.map(p => p.id).join(','));
  });

  const teamContainsPlayer = (team: Player[], playerOrTeam: Player[]) => {
    if (standingsAsWholeTeam.value) {
      return team.map(p => p.id).join(',') === playerOrTeam.map(p => p.id).join(',');
    } else {
      return team.map(p => p.id).includes(playerOrTeam[0].id);
    }
  };

  const standings = computed(() => {
    if (filteredMatches.value === null) {
      return null;
    }

    return _.chain(standingsAsWholeTeam.value ? uniqueTeams.value : players.value)
      .map(playerOrTeam => {

        const matches = _.filter(filteredMatches.value, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) || teamContainsPlayer(match.awayPlayers, playerOrTeam);
        });

        const matchesWon = _.filter(matches, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore > match.awayScore ||
          teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore > match.homeScore;
        });

        const matchesLost = _.filter(matches, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore < match.awayScore ||
          teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore < match.homeScore;
        });

        const matchesOvertimeLost = _.filter(matches, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore < match.awayScore && match.overtime ||
          teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore < match.homeScore && match.overtime;
        });

        const matchesOvertimeWin = _.filter(matches, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore > match.awayScore && match.overtime ||
          teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore > match.homeScore && match.overtime;
        });

        const matchesDraw = _.filter(matches, match => {
          return match.homeScore === match.awayScore && (teamContainsPlayer(match.homePlayers, playerOrTeam) || teamContainsPlayer(match.awayPlayers, playerOrTeam));
        });

        const points = _.sumBy(matchesWon, match => match.overtime ? match.game?.pointsForOTWin! : match.game?.pointsForWin!) +
          _.sumBy(matchesLost, match => match.overtime ? match.game?.pointsForOTLose! : 0) +
          _.sumBy(matchesDraw, match => match.game?.pointsForDraw!);

        const averagePlayedGamesByPlayerOrTeam = Math.floor((filteredMatches.value?.length || 0) * 0.122);

        const teamOrPlayerLoseAndWinStreak = _.chain(matches)
          .sortBy('played')
          .reverse()
          .map(match => {
            return teamContainsPlayer(match.homePlayers, playerOrTeam) && match.homeScore > match.awayScore ||
              teamContainsPlayer(match.awayPlayers, playerOrTeam) && match.awayScore > match.homeScore;
          })
          .map(result => result ? 'W' : 'L')
          .join('')
          .value();

        const loseOrWinStreakLatestStreakSameType = teamOrPlayerLoseAndWinStreak.match(/(W+|L+)/g)?.[0] || '';

        const goalsFor = _.sumBy(matches, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) ? match.homeScore : match.awayScore;
        });

        const goalsAgainst = _.sumBy(matches, match => {
          return teamContainsPlayer(match.homePlayers, playerOrTeam) ? match.awayScore : match.homeScore;
        });


        const currentPlayer = allPlayers.value?.find(p => p.username === playerOrTeam[0].username);
        const ownsGame = _.size(playerOrTeam) === 1
          && filteredGames.value.length === 1
          && _.find(currentPlayer?.ownedGames || [], gameId => gameId === filteredGames.value[0].id);

        // ELO is only calculated for individual players, not teams
        const elo = !standingsAsWholeTeam.value && playerOrTeam.length === 1
          ? Math.round(eloRatings.value[playerOrTeam[0].id] || 1500)
          : 0;

        return {
          player: playerOrTeam.map(p => p.username).join(','),
          ownsGame,
          wins: matchesWon.length,
          regularTimeWins: _.filter(matchesWon, match => !match.overtime).length,
          pointsForRegularTimeWins: _.sumBy(_.filter(matchesWon, match => !match.overtime), match => match.game?.pointsForWin!),
          losses: matchesLost.length,
          regularTimeLosses: _.filter(matchesLost, match => !match.overtime).length,
          draws: matchesDraw.length,
          pointsForDraws: _.sumBy(matchesDraw, match => match.game?.pointsForDraw!),
          matches: matches.length,
          overtimelosses: matchesOvertimeLost.length,
          pointsForOverTimeLose: _.sumBy(matchesOvertimeLost, match => match.game?.pointsForOTLose!),
          overtimewins: matchesOvertimeWin.length,
          pointsForOverTimeWin: _.sumBy(matchesOvertimeWin, match => match.game?.pointsForOTWin!),
          points,
          goalsFor,
          goalsAgainst,
          goalsDiff: goalsFor - goalsAgainst,
          playerPointsOfPercantage: points / _.sumBy(matches, match => match.game?.pointsForWin!),
          maximumPoints: _.sumBy(matches, match => match.game?.pointsForWin!),
          validResult: matches.length > averagePlayedGamesByPlayerOrTeam,
          loseOrWinStreakLatestStreak: loseOrWinStreakLatestStreakSameType.length,
          loseOrWinStreakLatestStreakType: loseOrWinStreakLatestStreakSameType[0].charAt(0),
          elo

        };
      })
      .sortBy(['validResult', 'elo', 'playerPointsOfPercantage', 'points'])
      .reverse()
      .map(standing => {
        return {
          ...standing,
          playerPointsOfPercantage: standing.playerPointsOfPercantage === 1 ? '1.00' : percentageFormat.format(standing.playerPointsOfPercantage).substring(1)
        }
      })
      .value() as unknown as StandingRow[];
  });

  return { standings, uniqueTeams, showDraws };
}

export function useMiscStatistics(filteredMatches: Ref<Match[] | null>, players: Ref<Player[][]>, uniqueTeams: Ref<Player[][]>) {
  const matchesWhichHaveWonSpecificPlayerCount = (playerCount: number) => {
    return _.chain(filteredMatches.value)
      .filter(match => (match.homePlayers.length === playerCount && match.homeScore > match.awayScore) || (match.awayPlayers.length === playerCount && match.homeScore < match.awayScore))
      .size()
      .thru(val => val / _.size(filteredMatches.value) * 100)
      .thru(val => val.toFixed(0) + '%')
      .value();
  };

  return computed(() => {
    return {
      matches: _.size(filteredMatches.value),
      players: _.size(players.value),
      teams: _.size(uniqueTeams.value),
      homeTeamWinPercentage: _.chain(filteredMatches.value)
        .filter(match => match.homeScore > match.awayScore)
        .size()
        .thru(val => val / _.size(filteredMatches.value) * 100)
        .thru(val => val.toFixed(0) + '%')
        .value(),
      onePlayerTeamWinPercentage: matchesWhichHaveWonSpecificPlayerCount(1),
      twoPlayerTeamWinPercentage: matchesWhichHaveWonSpecificPlayerCount(2),
      threePlayerTeamWinPercentage: matchesWhichHaveWonSpecificPlayerCount(3),
    };
  });
}
