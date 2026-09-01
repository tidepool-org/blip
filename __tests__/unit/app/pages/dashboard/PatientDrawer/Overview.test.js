/* global jest */
/* global expect */
/* global describe */
/* global it */

import React from 'react';
import { render, screen } from '@testing-library/react';

import Overview from '@app/components/PatientDrawer/Overview';

import { STATUS } from '@app/components/PatientDrawer/useAgpCGM';

describe('PatientDrawer/Overview', () => {
  const props = {
    patient: { id: '1234-abcd', fullName: 'Naoya Inoue' },
  };

  describe('When patient has no data in the platform', () => {
    it('shows no data fields and an appropriate message to the user', () => {
      const agpCGMData = { status: STATUS.NO_PATIENT_DATA };

      render(<Overview {...props} agpCGMData={agpCGMData} />);

      expect(screen.getByText('Naoya Inoue does not have any data yet.')).toBeInTheDocument();
      expect(screen.queryByText('Time in Ranges')).not.toBeInTheDocument();
      expect(screen.queryByText('Ambulatory Glucose Profile (AGP)')).not.toBeInTheDocument();
      expect(screen.queryByText('Daily Glucose Profiles')).not.toBeInTheDocument();
    });
  });

  describe('When patient has insufficient data to generate AGP report', () => {
    it('shows a message about data being insufficient', () => {
      const agpCGMData = { status: STATUS.INSUFFICIENT_DATA };

      render(<Overview {...props} agpCGMData={agpCGMData} />);

      expect(screen.getByText('Insufficient data to generate AGP Report.')).toBeInTheDocument();
      expect(screen.queryByText('Time in Ranges')).not.toBeInTheDocument();
      expect(screen.queryByText('Ambulatory Glucose Profile (AGP)')).not.toBeInTheDocument();
      expect(screen.queryByText('Daily Glucose Profiles')).not.toBeInTheDocument();
    });
  });

  describe('When AGP is still loading', () => {
    it('shows a loader', () => {
      const agpCGMData = { status: STATUS.PATIENT_LOADED }; // any intermediate state prior to 'SVGS_GENERATED'

      render(<Overview {...props} agpCGMData={agpCGMData} />);

      const loader = document.getElementsByClassName('loader')?.[0]; //eslint-disable-line
      expect(loader).toBeTruthy();

      expect(screen.queryByText('Time in Ranges')).not.toBeInTheDocument();
      expect(screen.queryByText('Ambulatory Glucose Profile (AGP)')).not.toBeInTheDocument();
      expect(screen.queryByText('Daily Glucose Profiles')).not.toBeInTheDocument();
    });
  });

  describe('When AGP is fully loaded', () => {
    describe('When enough data to render AGP Graph', () => {
      it('shows the AGP Report with all images', () => {
        const agpCGMData = {
          status: STATUS.SVGS_GENERATED,
          svgDataURLS: {
            agpCGM: {
              percentInRanges: 'percentInRanges.img.jpg',
              ambulatoryGlucoseProfile: 'ambulatoryGlucoseProfile.img.jpg',
              dailyGlucoseProfiles: ['daily.top.img.jpg', 'daily.bot.img.jpg'],
            },
          },
          agpCGM: {
            query: {
              bgSource: 'cbg',
              glycemicRanges: { type: 'preset', preset: 'adaStandard' },
            },
          },
        };

        render(<Overview {...props} agpCGMData={agpCGMData} />);

        expect(screen.getByText('Time in Ranges')).toBeInTheDocument();
        expect(screen.getByText('Ambulatory Glucose Profile (AGP)')).toBeInTheDocument();
        expect(screen.getByText('Daily Glucose Profiles')).toBeInTheDocument();

        const percentInRangesImage = screen.getByAltText('Time in Ranges Chart');
        const agpImage = screen.getByAltText('Ambulatory Glucose Profile (AGP) Chart');
        const dailyFirstImage = screen.getByAltText('Daily Glucose Profiles First Chart');
        const dailySecondImage = screen.getByAltText('Daily Glucose Profiles Second Chart');

        expect(percentInRangesImage).toHaveAttribute('src', 'percentInRanges.img.jpg');
        expect(agpImage).toHaveAttribute('src', 'ambulatoryGlucoseProfile.img.jpg');
        expect(dailyFirstImage).toHaveAttribute('src', 'daily.top.img.jpg');
        expect(dailySecondImage).toHaveAttribute('src', 'daily.bot.img.jpg');
      });
    });

    describe('When not enough data to render AGP Graph', () => {
      it('returns a value of undefined for AGP chart image', () => {
      const agpCGMData = {
        status: STATUS.SVGS_GENERATED,
        svgDataURLS: {
          agpCGM: {
            percentInRanges: 'percentInRanges.img.jpg',
            ambulatoryGlucoseProfile: undefined,
            dailyGlucoseProfiles: ['daily.top.img.jpg', 'daily.bot.img.jpg'],
          },
        },
        agpCGM: {
          query: {
            bgSource: 'cbg',
            glycemicRanges: { type: 'preset', preset: 'adaStandard' },
          },
        },
      };

      render(<Overview {...props} agpCGMData={agpCGMData} />);

        expect(screen.getByText('Insufficient CGM data to generate AGP graph')).toBeInTheDocument();

        expect(screen.getByText('Time in Ranges')).toBeInTheDocument();
        expect(screen.getByText('Ambulatory Glucose Profile (AGP)')).toBeInTheDocument();
        expect(screen.getByText('Daily Glucose Profiles')).toBeInTheDocument();

        // Not enough data to display
        const agpImage = screen.queryByAltText('Ambulatory Glucose Profile (AGP) Chart');
        expect(agpImage).not.toHaveAttribute('src');

        const percentInRangesImage = screen.getByAltText('Time in Ranges Chart');
        const dailyFirstImage = screen.getByAltText('Daily Glucose Profiles First Chart');
        const dailySecondImage = screen.getByAltText('Daily Glucose Profiles Second Chart');

        expect(percentInRangesImage).toHaveAttribute('src', 'percentInRanges.img.jpg');
        expect(dailyFirstImage).toHaveAttribute('src', 'daily.top.img.jpg');
        expect(dailySecondImage).toHaveAttribute('src', 'daily.bot.img.jpg');
      });
    });
  });
});
