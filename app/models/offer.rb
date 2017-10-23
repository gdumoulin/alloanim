class Offer < ApplicationRecord
  belongs_to :center
  belongs_to :school

  validates :date, presence:true
  validates :time_slot, presence:true
  validates :diploma, presence:true
  validates :offer_number, presence:true

end