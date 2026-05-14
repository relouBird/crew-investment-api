// user-bet/user-bet.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiFootballCompetitionResponse,
  ApiFootballTeamsResponse,
} from 'src/types/api-bet.type';

interface APIProps {
  BASE_URL: string;
  API_KEY: string;
}

@Injectable()
export class AdminMatchService {
  private API: APIProps;

  constructor(private configService: ConfigService) {
    this.API = {
      BASE_URL: this.configService.get('FOOTBALL_API_URL')!,
      API_KEY: this.configService.get('FOOTBALL_API_KEY')!,
    };
  }

  // ceci permet de gerer les requetes...
  async footballApiRequest(endpoint: string = '') {
    const url = `${this.API.BASE_URL}/${endpoint}`;
    console.log('GET / url =>', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': `${this.API.API_KEY}`, // ta clé secrète
      },
    });
    return response;
  }

  //---------------------------------------
  //--------------COMPETITIONS-------------
  //---------------------------------------

  /**
   * Cette fonction permet de recuperer toutes les competitions...
   * @param {ApiFootballErrorHandler} errorHandler c'est la fonction qui permet de gerer les erreurs...
   * @returns {Promise<ApiFootballCompetitionResponse | null>}
   */
  async getAllMatchCompetitions(): Promise<ApiFootballCompetitionResponse | null> {
    try {
      const response = await this.footballApiRequest('competitions');

      if (!response.ok) {
        console.log(
          `Get competitions failed: ${response.status} ${await response.text()}`,
        );
        return null;
      }
      const competitions =
        (await response.json()) as ApiFootballCompetitionResponse;
      console.log('Competitions getted:', competitions);
      return competitions;
    } catch (error) {
      console.log('get-competitions-error =>', error);
      throw new ForbiddenException(
        'Erreur de la recuperation de la ressource Compétition.',
      );
    }
  }

  /**
   * Cette fonction permet de recuperer toutes les equipes d'une compétition...
   * @param {string} competitionId c'est l'id de la competition
   * @param {ApiFootballErrorHandler} errorHandler c'est la fonction qui permet de gerer les erreurs...
   * @returns {Promise<ApiFootballTeamsResponse | null>}
   */
  async getAllTeamsCompetitions(
    competitionId: string,
  ): Promise<ApiFootballTeamsResponse | null> {
    try {
      const response = await this.footballApiRequest(
        `competitions/${competitionId}/teams?season=2025`,
      );

      if (!response.ok) {
        console.log(
          `Get matchs-competitions failed: ${response.status} ${await response.text()}`,
        );
        return null;
      }
      const matches = (await response.json()) as ApiFootballTeamsResponse;
      console.log('Matchs getted:', matches);
      return matches;
    } catch (error) {
      console.log('get-matchs-error =>', error);
      throw new ForbiddenException(
        'Erreur de la recuperation de la ressource Equipes.',
      );
    }
  }
}
