import { computed } from 'vue';
import _ from 'lodash';
import moment from 'moment';
import { calculateEloRatings, BASE_ELO } from '@/utils/elo';
import { getInitials, getPlayerColor } from '@/utils/playerUi';
import { useFilteredMatches } from './useFilteredMatches';
import { usePlayerStandings } from './usePlayerStandings';

export interface HighlightCard {
  tag: string;
  tagColor: string;
  value: string;
  valueSize: string;
  sub: string;
  spanFull: boolean;
  gradient?: boolean;
}

function teamKey(players: { id: string }[]): string {
  return players
    .map((p) => p.id)
    .sort()
    .join(',');
}

export function useHighlights() {
  const { filteredMatches } = useFilteredMatches();
  const { standings, playerIds } = usePlayerStandings();

  const biggestMovers = computed(() => {
    const weekAgo = moment().subtract(7, 'days').valueOf();
    const recent = filteredMatches.value.filter((m) => (m.played ?? 0) >= weekAgo);
    if (recent.length === 0) return [];

    const allMatches = filteredMatches.value;
    const players = _.chain(allMatches)
      .flatMap((m) => [...m.homePlayers, ...m.awayPlayers])
      .uniqBy('id')
      .map((p) => [p])
      .value();

    const { eloRatings: currentElos } = calculateEloRatings(allMatches, players);
    const beforeRecent = allMatches.filter((m) => (m.played ?? 0) < weekAgo);
    const { eloRatings: beforeElos } = calculateEloRatings(beforeRecent, players);

    return _.chain(players)
      .map(([p]) => {
        const delta = Math.round((currentElos[p.id] ?? BASE_ELO) - (beforeElos[p.id] ?? BASE_ELO));
        return {
          id: p.id,
          name: p.username.split(' ')[0],
          initials: getInitials(p.username),
          color: getPlayerColor(p.id, playerIds.value),
          delta,
          deltaLabel: `${delta >= 0 ? '+' : ''}${delta}`,
        };
      })
      .filter((m) => m.delta !== 0)
      .orderBy([(m) => Math.abs(m.delta)], ['desc'])
      .take(4)
      .value();
  });

  const statCards = computed((): HighlightCard[] => {
    const matches = filteredMatches.value;
    const ranked = standings.value;

    const hottest = _.maxBy(ranked, (p) =>
      p.streakType === 'W' ? p.streakCount : 0
    );
    const hotStreak = hottest?.streakType === 'W' && hottest.streakCount >= 2 ? hottest : null;

    const monthStart = moment().startOf('month').valueOf();
    const monthMatches = matches.filter((m) => (m.played ?? 0) >= monthStart);
    const activityCounts: Record<string, number> = {};
    monthMatches.forEach((m) => {
      [...m.homePlayers, ...m.awayPlayers].forEach((p) => {
        activityCounts[p.id] = (activityCounts[p.id] ?? 0) + 1;
      });
    });
    const mostActiveId = _.maxBy(Object.keys(activityCounts), (id) => activityCounts[id]);
    const mostActive = ranked.find((p) => p.id === mostActiveId);

    const duoStats: Record<string, { wins: number; losses: number; names: string }> = {};
    matches.forEach((m) => {
      const homeKey = teamKey(m.homePlayers);
      const awayKey = teamKey(m.awayPlayers);
      if (m.homePlayers.length === 2) {
        if (!duoStats[homeKey]) {
          duoStats[homeKey] = {
            wins: 0,
            losses: 0,
            names: m.homePlayers.map((p) => p.username.split(' ')[0]).join(' + '),
          };
        }
        if (m.homeScore > m.awayScore) duoStats[homeKey].wins++;
        else if (m.homeScore < m.awayScore) duoStats[homeKey].losses++;
      }
      if (m.awayPlayers.length === 2) {
        if (!duoStats[awayKey]) {
          duoStats[awayKey] = {
            wins: 0,
            losses: 0,
            names: m.awayPlayers.map((p) => p.username.split(' ')[0]).join(' + '),
          };
        }
        if (m.awayScore > m.homeScore) duoStats[awayKey].wins++;
        else if (m.awayScore < m.homeScore) duoStats[awayKey].losses++;
      }
    });
    const bestDuo = _.maxBy(Object.values(duoStats), (d) => d.wins - d.losses);

    const rivalryCounts: Record<string, number> = {};
    matches.forEach((m) => {
      m.homePlayers.forEach((hp) => {
        m.awayPlayers.forEach((ap) => {
          const key = [hp.id, ap.id].sort().join(':');
          rivalryCounts[key] = (rivalryCounts[key] ?? 0) + 1;
        });
      });
    });
    const topRivalryKey = _.maxBy(Object.keys(rivalryCounts), (k) => rivalryCounts[k]);
    let rivalryLabel = '—';
    if (topRivalryKey) {
      const [id1, id2] = topRivalryKey.split(':');
      const p1 = ranked.find((p) => p.id === id1);
      const p2 = ranked.find((p) => p.id === id2);
      if (p1 && p2) {
        rivalryLabel = `${p1.shortName} vs ${p2.shortName}`;
      }
    }

    const cards: HighlightCard[] = [];

    if (hotStreak) {
      cards.push({
        tag: '🔥 HOTTEST STREAK',
        tagColor: '#FF5B39',
        value: `${hotStreak.shortName} · W${hotStreak.streakCount}`,
        valueSize: '26px',
        sub: `${hotStreak.streakCount} straight wins`,
        spanFull: true,
        gradient: true,
      });
    }

    cards.push({
      tag: 'MOST ACTIVE',
      tagColor: '#38A6FF',
      value: mostActive?.shortName ?? '—',
      valueSize: '24px',
      sub: mostActive
        ? `${activityCounts[mostActive.id] ?? 0} matches this month`
        : 'No matches yet',
      spanFull: false,
    });

    if (bestDuo) {
      cards.push({
        tag: 'BEST DUO',
        tagColor: '#C6FF3D',
        value: `${bestDuo.wins}–${bestDuo.losses}`,
        valueSize: '26px',
        sub: bestDuo.names,
        spanFull: false,
      });
    }

    cards.push({
      tag: 'TOP RIVALRY',
      tagColor: '#B98CFF',
      value: topRivalryKey ? String(rivalryCounts[topRivalryKey]) : '0',
      valueSize: '26px',
      sub: topRivalryKey ? `${rivalryLabel} games` : 'No rivalries yet',
      spanFull: false,
    });

    return cards;
  });

  return { statCards, biggestMovers };
}
